import { ReactNode } from "react";
import { Avatar, Badge, Button, Image, Pill, ScrollArea } from "@mantine/core";
import { RecordModel } from "pocketbase";
import { useRef, useState } from 'react';
import { Combobox, Loader, TextInput, useCombobox } from '@mantine/core';

export interface BasicProps {
    children: ReactNode | ReactNode[];
}


export function True({ bool, children }: { bool: boolean } & BasicProps) {
    if (bool) return children
}


export function Header({ children }: BasicProps) {
    return <>
        <div className='text-xl font-bold mb-6'>Artcon {children}</div>
    </>
}

export function Figure(image: RecordModel) {
    return <>
        <div className="group w-[245px] relative flex flex-col gap-2 shrink-0">
            {
                image['disable'] ?
                    <>
                        <div className="relative w-[245px] h-[345px] rounded-lg overflow-hidden bg-neutral-400">
                            <Image w={245} h={345} fit="cover" className="max-w-none" src={`/api/files/images/${image.id}/${image.image}?thumb=0x720`}></Image>
                            <div className="absolute top-0 left-0 transition-all pointer-events-none w-full bg-transparent group-hover:bg-black/40 size-full">
                            </div>
                        </div>
                        <div className="font-semibold flex justify-between py-1">
                            <div>{image.name}</div>
                            <True bool={image.buyable} >
                                <Badge size="lg" color="pink">{image.price} c</Badge>
                            </True>
                        </div>
                    </>
                    :
                    <a href={`/view/${image.id}`} className="cursor-pointer">
                        <div className="relative w-[245px] h-[345px] rounded-lg overflow-hidden bg-neutral-400">
                            <Image w={245} h={345} fit="cover" className="max-w-none" src={`/api/files/images/${image.id}/${image.image}?thumb=0x720`}></Image>
                            <div className="absolute top-0 left-0 transition-all pointer-events-none w-full bg-transparent group-hover:bg-black/40 size-full">
                            </div>
                        </div>
                        <div className="font-semibold flex justify-between py-1">
                            <div>{image.name}</div>
                            <True bool={image.buyable} >
                                <Badge size="lg" color="pink">{image.price} c</Badge>
                                {/* <div className="shrink-0 bg-neutral-200 text-neutral-900 rounded px-2">
                            {image.price}c
                        </div> */}
                            </True>
                        </div>
                    </a>
            }
            <div className="flex gap-2 items-center text-sm">
                <Avatar size={32} src={`/api/files/users/${image.expand!.owner.id}/${image.expand!.owner.avatar}`}></Avatar>
                <div>{image.expand!.owner.name}</div>
            </div>
        </div>
    </>
}
