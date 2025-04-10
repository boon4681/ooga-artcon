
routerAdd('GET', '/*', (c) => {
    const path = $apis.requestInfo(c).path;
    if (path.startsWith('/api/') || path.startsWith('/_/')) {
        return c.next();
    }

    try {
        return c.staticFile('pb_public/' + path);
    } catch (e) {
        return c.staticFile('pb_public/index.html');
    }
});

routerAdd('POST', '/api/buy', (c) => {
    const user = c.auth;
    if (!user) {
        return c.json(403, { message: 'Authentication required' });
    }

    const data = c.requestInfo().body;
    const { id } = data;

    if (!id) {
        return c.json(400, { message: 'Missing required fields: itemId or itemPrice' });
    }

    const wallet = $app.findFirstRecordByFilter(
        'wallet',
        `owner = '${user.id}'`
    );
    const image = $app.findFirstRecordByFilter(
        'images',
        `id = '${id}'`
    );
    const artist = $app.findFirstRecordByFilter(
        'wallet',
        `owner = '${image.get('owner')}'`
    );

    if (!wallet) {
        return c.json(404, { message: 'Wallet not found' });
    }

    if (wallet.get('coins') < image.get('price')) {
        return c.json(400, { message: 'Insufficient funds' });
    }

    try {
        $app.runInTransaction((txDao) => {
            let collection = $app.findCollectionByNameOrId("collections")
            let record = new Record(collection)
            record.set("owner", user.id)
            record.set("image", id)

            txDao.save(record);
            wallet.set('coins', wallet.get('coins') - image.get('price'));
            artist.set('coins', artist.get('coins') + image.get('price'));

            txDao.save(artist);
            txDao.save(wallet);
        });

        return c.json(200, {
            message: 'Purchase successful',
            remainingCoins: wallet.get('coins')
        });
    } catch (error) {
        return c.json(500, { message: 'Failed to process purchase', error: error.message });
    }
}, $apis.requireAuth());