import { Avatar, Button, FloatingIndicator, Grid, Image, Tabs } from "@mantine/core";
import { AuthContext, pb, WalletContext } from "../lib/pb";
import { use, useEffect, useState } from "react";
import { AuthRecord, RecordModel } from "pocketbase";
import { useNavigate } from "react-router-dom";
import { Figure, Header, True } from "../lib/components";
import clsx from "clsx";
import classes from './profile.module.css';
export const ProfilePage = () => {
    const navigate = useNavigate();

    const user = use(AuthContext)
    if (!user) return
    const [images, setImages] = useState<RecordModel[]>([])
    const [collections, setCollections] = useState<RecordModel[]>([])

    const loadAllImage = async () => {
        const records = await pb.collection('images').getFullList({
            expand: "owner",
            filter: "owner.id = " + '"' + user.id + '"',
            sort: "-created"
        });
        setImages(records)
    }

    const loadAllCollections = async () => {
        const records = await pb.collection('collections').getFullList({
            expand: "owner, image",
            filter: "owner.id = " + '"' + user.id + '"',
            sort: "-created"
        });
        setCollections(records)
    }

    useEffect(() => {
        loadAllImage()
        loadAllCollections()
    }, [])

    const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
    const [value, setValue] = useState<string | null>('my uploads');
    const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({});
    const setControlRef = (val: string) => (node: HTMLButtonElement) => {
        controlsRefs[val] = node;
        setControlsRefs(controlsRefs);
    };

    pb.collection('images').subscribe('*', function (e) {
        loadAllImage()
    }, { filter: "owner.id = " + '"' + user.id + '"', })

    return (
        <>
            <Header>
                Home
            </Header>
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <Avatar size={48} src={`/api/files/users/${user.id}/${user.avatar}`}></Avatar>
                        <div>{user.name}</div>
                    </div>
                    <Button
                        variant="light"
                        color="red"
                        onClick={() => {
                            pb.authStore.clear()
                        }}>Logout</Button>
                </div>
                <div className="my-2 border-b"></div>
                <Grid w="100%" grow>
                    <Grid.Col span={6}>
                        <Button w="100%" onClick={() => navigate("/discovery")}>Discovery</Button>
                    </Grid.Col>
                    <Grid.Col span={1}>
                        <Button w="100%" color="dark" onClick={() => navigate("/upload")}>Upload</Button>
                    </Grid.Col>
                </Grid>
            </div>
            <div className="min-h-[600px]">
            <Tabs variant="none" defaultValue="my uploads" value={value} onChange={setValue}>
                <Tabs.List ref={setRootRef} className={classes.list}>
                    <Tabs.Tab ref={setControlRef('my uploads')} className={classes.tab} value="my uploads">My Upload</Tabs.Tab>
                    <Tabs.Tab ref={setControlRef('collections')} className={classes.tab} value="collections">Collections</Tabs.Tab>

                    <FloatingIndicator
                        target={value ? controlsRefs[value] : null}
                        parent={rootRef}
                        className={classes.indicator}
                    />
                </Tabs.List>

                <Tabs.Panel value="my uploads">
                    <div className={clsx("grid justify-center md:justify-start md:grid-cols-2 gap-4 w-full")}>
                        {images.map((a, i) => <Figure {...a} key={i} />)}
                    </div>
                    <True bool={images.length == 0}><div className="text-center">No data</div></True>
                </Tabs.Panel>
                <Tabs.Panel value="collections">
                    <div className={clsx("grid justify-center md:justify-start md:grid-cols-2 gap-4 w-full")}>
                        {/* {JSON.stringify(collections.map(a => ({ ...a.expand!['image'], expand: { owner: a.expand!['owner'] } })))} */}
                        {collections.map(a => ({ ...a.expand!['image'], buyable: false, expand: { owner: a.expand!['owner'] } })).map((a, i) => <Figure {...a} key={i} />)}
                    </div>
                    <True bool={collections.length == 0}><div className="text-center">No data</div></True>
                </Tabs.Panel>
            </Tabs>
            </div>
        </>
    )
}