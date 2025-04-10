import PocketBase, { RecordModel } from 'pocketbase'
import { createContext } from 'react';
// import raw from "./selected_tags.csv?raw"
export const pb = new PocketBase('http://127.0.0.1:8090');
pb.autoCancellation(false);

// ; (async () => {
//     // console.log(raw.replace(/\r/g, "").split("\n").filter(a=>a).map(a=>a.split(",")).slice(1))
//     // return
//     for (const a of raw.replace(/\r/g, "").split("\n").filter(a => a).map(a => a.split(",")).slice(1)) {
//         await pb.collection("tags").create({
//             id: a[0] + "",
//             name: a[1] + "",
//             category: Number(a[2]),
//             count: Number(a[3] ?? "0")
//         })
//     }
//         // pb.collection("tags").create({
//         //     id: a[0] + "",
//         //     name: a[1] + "",
//         //     category: a[2] + ""
//         // })

//     //     pb.collection("tags").create({
//     //         id:a.id
//     // })
// })();

export const AuthContext = createContext(pb.authStore.record);
export const WalletContext = createContext<RecordModel | null>(null);