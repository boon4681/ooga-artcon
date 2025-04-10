import { Avatar, Button, Image, ScrollArea } from "@mantine/core";
import { AuthContext, pb } from "../lib/pb";
import { ReactNode, use, useEffect, useState } from "react";
import { AuthRecord, RecordModel } from "pocketbase";
import { LoginPage } from "./Login.page";
import { ProfilePage } from "./Profile.page";
import { clsx } from 'clsx';
import { Figure, True } from "../lib/components";

export function DiscoveryPage() {
    const [images, setImages] = useState<RecordModel[]>([])

    const loadAllImage = async () => {
        const records = await pb.collection('images').getFullList({
            expand: "owner",
            sort: "-created"
        });
        console.log(records)
        setImages(records)
    }

    useEffect(() => {
        loadAllImage()
        return () => {
            pb.collection('images').unsubscribe("*")
        }
    }, [])

    pb.collection('images').subscribe('*', function (e) {
        loadAllImage()
    })

    return <>
        <a href='/'>{"< Home"}</a>
        <div className='text-xl font-bold mb-6'>Artcon Discovery</div>
        <div className={clsx("grid justify-center md:justify-start md:grid-cols-2 gap-4 w-full")}>
            {images.map((a, i) => <Figure {...a} key={i} />)}
        </div>
        {/* {JSON.stringify(images)} */}
    </>
}