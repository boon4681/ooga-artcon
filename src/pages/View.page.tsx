import { RecordModel } from "pocketbase";
import { use, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext, pb, WalletContext } from "../lib/pb";
import { Avatar, Badge, Button, Card, Divider, Grid, Group, Image, Modal, Paper, Pill, Skeleton, Stack, Text, Title } from "@mantine/core";
import { useImageOnLoad } from "../lib/use-image-on-load";
import { Header, True } from "../lib/components";
import { useDisclosure } from "@mantine/hooks";
import { Wallet } from "lucide-react"
import classes from './upload.module.css';

export function ViewImagePage() {
    const user = use(AuthContext)
    const navigate = useNavigate();
    const wallet = use(WalletContext)
    const { markers, markLoad, markError } = useImageOnLoad(
        "media"
    );
    let { id } = useParams();

    const [image, setImage] = useState<RecordModel>()
    const [opened, { open, close }] = useDisclosure(false);

    const loadImage = async () => {
        markLoad("media")
        const records = await pb.collection('images').getOne(id!, {
            expand: "owner, tags"
        });
        console.log(records)
        setImage(records)
    }

    useEffect(() => {
        loadImage()
    }, [])
    if (!image) return <>Not Found</>
    return <>
        <a href='/'>{"< Home"}</a>
        <Header>View</Header>
        <div>
            <Skeleton visible={!markers.media.complete} className="place-items-center bg-slate-200" >
                <Image onError={() => markError("media")} w="auto" h={560} fit="cover" className="max-w-none rounded-lg bg-neutral-400" src={`/api/files/images/${image.id}/${image.image}`}></Image>
            </Skeleton>
            <div className="font-semibold flex justify-between py-1 text-lg">
                <div className="h-full mr-auto">
                    <div className="text-md font-semibold">{image.name}</div>
                    <div className="flex gap-2 items-center text-sm">
                        <Avatar size={32} src={`/api/files/users/${image.expand!.owner.id}/${image.expand!.owner.avatar}`}></Avatar>
                        <div>{image.expand!.owner.name}</div>
                    </div>
                </div>
                <True bool={image.buyable} >
                    <div className="flex items-center">
                        <Badge size="lg" color="pink">{image.price} c</Badge>
                    </div>
                </True>
            </div>
        </div>
        <Divider my="sm"></Divider>
        <Text>Tags</Text>
        <True bool={!image.expand['tags']}>
            <div className="text-sm">No data</div>
        </True>
        <Pill.Group pb="sm">{(image.expand['tags'] ?? []).map((item, index) => (
            <Pill key={index}
                classNames={{
                    root: classes['pill-' + item.name] ?? classes['pill-' + item.category]
                }}>
                {item.name}
            </Pill>
        ))}</Pill.Group>
        <True bool={image.buyable && image.expand['owner'].id != user?.id} >
            <Card shadow="sm" padding="lg" mt="xl" radius="md" withBorder>
                <Card.Section withBorder inheritPadding pb="sm">
                    <Button w="100%" color="dark" className="mt-4" onClick={() => open()}>Buy</Button>
                </Card.Section>
                <Group pt="sm">

                </Group>
            </Card>
        </True>
        <Modal opened={opened} onClose={close} withCloseButton={false} closeOnEscape={false} closeOnClickOutside={false} zIndex={100} centered>
            <Text size="lg" fw={700}>Confirm?</Text>
            <Divider my="sm"></Divider>
            <div className="flex gap-4">
                <Image onError={() => markError("media")} fit="cover" w="80px" radius="md" className="max-w-none aspect-square rounded-lg bg-neutral-400" src={`/api/files/images/${image.id}/${image.image}`}></Image>
                <div className="h-full mr-auto">
                    <div className="text-md font-semibold">{image.name}</div>
                    <div className="flex gap-2 items-center text-sm">
                        <Avatar size={32} src={`/api/files/users/${image.expand!.owner.id}/${image.expand!.owner.avatar}`}></Avatar>
                        <div>{image.expand!.owner.name}</div>
                    </div>
                </div>
                <div className="flex items-center">
                    <Badge size="lg" color="pink">{image.price} c</Badge>
                </div>
            </div>
            <Divider mt="sm"></Divider>
            <Stack className='bg-white sticky top-0 left-0 z-10 pt-4'>
                <div className='flex gap-2 justify-between items-center'>
                    <div className='flex gap-2'>
                        <Wallet></Wallet> <Text fw={700}>My wallet</Text>
                    </div>
                    <Badge size="md">{wallet?.['coins']} coins</Badge>
                </div>
                <Divider></Divider>
            </Stack>
            {/* <Divider mt="sm"></Divider> */}
            <Grid w="100%" grow>
                <Grid.Col span={6}>
                    <Button
                        w="100%" color="violet" className="mt-4"
                        disabled={wallet?.['coins'] < image['price']}
                        onClick={() => {
                            pb.send("/api/buy", {
                                method: "post",
                                body: {
                                    id: image.id
                                }
                            }).then(e => {
                                close()
                                setTimeout(() => {
                                    navigate("/")
                                }, 500)
                            });
                        }}
                    >
                        {wallet?.['coins'] < image['price'] ? "Not enough coins" : "Purchase"}
                    </Button>
                </Grid.Col>
                <Grid.Col span={1}>
                    <Button w="100%" color="dark" className="mt-4" onClick={() => close()}>Cancle</Button>
                </Grid.Col>
            </Grid>
        </Modal>
        <div className="h-[200px]"></div>
    </>
}