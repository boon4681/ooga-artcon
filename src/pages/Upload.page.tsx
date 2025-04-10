import { Accordion, Avatar, Button, CloseButton, Group, Image, InputBase, LoadingOverlay, Modal, NumberInput, SimpleGrid, Switch, Text, TextInput, Pill, Autocomplete, AutocompleteProps, Loader } from "@mantine/core";
import { AuthContext, pb } from "../lib/pb";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header, True } from "../lib/components";
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from '@mantine/dropzone';
import { Image as ImageIcon } from "lucide-react"
import clsx from "clsx";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { debounce } from 'lodash';
import classes from './upload.module.css';

export function UploadPage() {
    type Tag = { id: string, name: string, category: string }
    const navigate = useNavigate();
    const user = use(AuthContext)
    if (!user) {
        useEffect(() => { navigate("/") }, [])
        return
    }

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            name: '',
            image: null,
            buyable: false,
            price: null,
            tags: []
        } as {
            name: string,
            image: null | File,
            buyable: boolean,
            price: null | number,
            tags: string[]
        },

        validate: {
            name: (value) => (value.length > 0 ? null : 'Required'),
            image: (value) => (value ? (value instanceof File) ? null : "" : 'Required')
        },
        onValuesChange: (values) => {
            // console.log(form.isValid(), form.validate())
        },
    });
    const defaultSearch = [
        {
            id: "9999996",
            name: "explicit",
            category: "9"
        },
        {
            id: "9999997",
            name: "questionable",
            category: "9"
        },
        {
            id: "9999998",
            name: "sensitive",
            category: "9"
        },
        {
            id: "9999999",
            name: "general",
            category: "9"
        },
    ]
    const [visible, { open, close }] = useDisclosure(false);
    const [query, setQuery] = useState<string>('')
    const [searchedTags, setSearchedTags] = useState<Tag[]>(defaultSearch)
    const [onSearch, setOnSearch] = useState<boolean>(false)
    const [taged, setTaged] = useState<Tag[]>([])

    const debouncedSearch = useCallback(
        debounce(async (query) => {
            const tags = await pb.collection("tags").getList(1, 40, {
                sort: '-count',
                filter: `id~"${query}"||name~"${query}%"||category~"${query}"||created~"${query}"||updated~"${query}"`
            }) as any
            // console.log(tags)
            setSearchedTags(tags.items)
            setOnSearch(false)
        }, 500),
        []
    );

    useEffect(() => {
        console.log(query)
        if (query.trim().length > 0) {
            setOnSearch(true)
            debouncedSearch(query);
        } else {
            setSearchedTags(defaultSearch);
        }
    }, [query]);

    const [files, setFiles] = useState<FileWithPath[]>([]);
    const previews = files.map((file, index) => {
        const imageUrl = URL.createObjectURL(file);
        return <div key={index}>
            <Image fit="contain" className="absolute top-0 left-0" h="100%" src={imageUrl} onLoad={() => URL.revokeObjectURL(imageUrl)} />
        </div>;
    });

    useEffect(() => {
        form.setValues({ image: (files ?? [])[0] })
    }, [files])

    useEffect(() => {
        form.setValues({ tags: taged.map(a => a.id) })
    }, [taged])
    const renderAutocompleteOption: AutocompleteProps['renderOption'] = ({ option }) => {
        const v = searchedTags.find(a => a.name == option.value)!
        return (
            <Group gap="sm" w="100%" justify="space-between">
                <Text size="sm">{option.value}</Text>
                <Pill size="sm"
                    classNames={{
                        root: classes['pill-' + v.name] ?? classes['pill-' + v.category]
                    }}
                >{{
                    0: "tag",
                    4: "character",
                    9: "general"
                }[v.category]}</Pill>
                {/* <Avatar src={usersData[option.value].image} size={36} radius="xl" />
                <div>
                    <Text size="sm">{option.value}</Text>
                    <Text size="xs" opacity={0.5}>
                        {usersData[option.value].email}
                    </Text>
                </div> */}
            </Group>
        )
    };
    return (
        <>
            <a href='/'>{"< Home"}</a>
            <Header>
                Upload
            </Header>
            <form className="w-full flex flex-col gap-4" onSubmit={
                form.onSubmit(async (values) => {
                    // console.log(values)
                    open()
                    const result = await pb.collection("images").create({ ...values, owner: user.id }).catch(a => false)
                    setTimeout(() => {
                        close()
                    }, 250)

                    if (result) setTimeout(() => {
                        navigate("/")
                    }, 500)
                })
            }>
                <LoadingOverlay pos="fixed" visible={visible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                <div className="aspect-[245/345] h-[560px] relative rounded-lg overflow-hidden bg-slate-200">
                    <Dropzone radius="md" className={clsx("size-full flex justify-center items-center", previews.length != 0 ? "opacity-0" : "")} maxFiles={1} multiple={false} accept={IMAGE_MIME_TYPE} onDrop={setFiles}>
                        <True bool={previews.length == 0}>
                            <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                                <Dropzone.Idle>
                                    <ImageIcon size={52} color="var(--mantine-color-dimmed)" />
                                </Dropzone.Idle>
                                <Text ta="center">Drop image here</Text>
                            </Group>
                        </True>
                    </Dropzone>
                    <True bool={previews.length > 0}>
                        <CloseButton onClick={() => setFiles([])} className="top-2 right-2 z-10" pos="absolute" size="lg" />
                    </True>
                    {previews}
                </div>
                <True bool={form.isValid("image")}>
                    <TextInput
                        withAsterisk
                        label="Name"
                        placeholder="image name"
                        key={form.key('name')}
                        {...form.getInputProps('name')}
                    />
                    <InputBase className="nb" component="div" label="Tags" multiline {...form.getInputProps('tags')}>
                        <div className="flex -mr-2.5 items-center">
                            <Autocomplete
                                placeholder="tags"
                                limit={5}
                                w="100%"
                                onChange={(e) => {
                                    const n = searchedTags.find(a => a.name == e)
                                    if (n) {
                                        setQuery("")
                                    } else {
                                        setQuery(e)
                                    }
                                }}
                                value={query}
                                onOptionSubmit={(e) => {
                                    const n = searchedTags.find(a => a.name == e)
                                    if (n) {
                                        const ss = new Set(taged.map(a => a.name))
                                        if (!ss.has(n.name)) {
                                            taged.push(n)
                                            setTaged(Array.from(taged))
                                        }
                                    }
                                }}
                                renderOption={renderAutocompleteOption}
                                data={searchedTags.map(a => (a.name))}
                                rightSectionPointerEvents="none"
                                rightSection={onSearch ? <Loader size="sm"></Loader> : null}
                            />
                            <Button color="blue" variant="outline" size="xs" className="shrink-0" onClick={() => {
                                open()
                                const form = new FormData();
                                form.append("image", files[0]);
                                fetch('/predict', {
                                    method: 'POST',
                                    body: form
                                }).then(response => response.json())
                                    .then((response: Record<string, any>) => {
                                        // console.log(response)
                                        // console.log((response['tags'].map((a:string)=> "name="+a)).join(" || "))
                                        pb.collection("tags").getFullList({
                                            filter: response['tags'].map((a: string) => "name=" + JSON.stringify(a)).join(" || ")
                                        }).then(e => {
                                            for (const n of e as any) {
                                                const ss = new Set(taged.map(a => a.name))
                                                if (!ss.has(n.name)) {
                                                    taged.push(n)
                                                    setTaged(Array.from(taged))
                                                }
                                            }
                                        })
                                        close()
                                    })
                                    .catch(err => {
                                        console.error(err)
                                        close()
                                    });
                            }}>Auto Gen</Button>
                        </div>
                        <Pill.Group pb="sm">{taged.map((item, index) => (
                            <Pill key={index}
                                classNames={{
                                    root: classes['pill-' + item.name] ?? classes['pill-' + item.category]
                                }}
                                withRemoveButton onRemove={() => {
                                    setTaged(taged.filter(a => a.name != item.name))
                                }}>
                                {item.name}
                            </Pill>
                        ))}</Pill.Group>
                    </InputBase>
                    <div className="flex flex-col">
                        <Switch
                            defaultChecked={false}
                            label="I'm selling this image."
                            onChange={(e) => form.setValues({ buyable: e.currentTarget.checked })}
                        />
                        <div className={clsx("overflow-y-hidden transition-all", !form.getValues().buyable ? "h-0 opacity-0" : "h-20 opacity-100 pt-2")}>
                            <NumberInput
                                withAsterisk
                                decimalScale={0}
                                fixedDecimalScale
                                min={0}
                                suffix=" coins"
                                onChange={(e) => form.setValues({ price: Number(e) })}
                                label="Price" placeholder="Price" hideControls
                            />
                        </div>
                    </div>
                    <Button type="submit" disabled={!form.isValid()}>Upload</Button>
                </True>
            </form >
            <div className="h-[200px]"></div>
        </>
    );
}