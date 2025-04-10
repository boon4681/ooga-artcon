import '@mantine/core/styles.css';

import { Badge, Divider, MantineProvider, Stack, Text } from '@mantine/core';
import { Router } from './Router';
import { theme } from './theme.ts';
import { AuthContext, pb, WalletContext } from './lib/pb.ts';
import { useEffect, useState } from 'react';
import { AuthRecord, RecordModel } from 'pocketbase';
import { Header } from './lib/components.tsx';
import { Wallet } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<AuthRecord | null>(null)
  const [wallet, setWallet] = useState<RecordModel | null>(null)

  useEffect(() => {
    // pb.authStore.loadFromCookie(document.cookie)
    pb.authStore.onChange((token, record) => {
      setUser(record)
      if (record) {
        pb.collection("wallet").getFirstListItem("owner.id=" + JSON.stringify(record.id)).then(e => {
          setWallet(e)
        })
        pb.collection('wallet').subscribe('*', function ({ record }) {
          setWallet(record)
        }, { filter: "owner.id = " + '"' + record.id + '"', })
      } else {
        pb.collection("wallet").unsubscribe("")
      }
      // console.log(record)
    }, true)
  }, [])
  return (
    <MantineProvider theme={theme}>
      <AuthContext.Provider value={user}>
        <WalletContext.Provider value={wallet}>
          <div className='flex flex-col gap-2 w-full' >
            {user && wallet ? <>
              <Stack className='bg-white sticky top-0 left-0 z-10 pt-4'>
                <div className='flex gap-2 justify-between items-center'>
                  <div className='flex gap-2'>
                    <Wallet></Wallet> <Text fw={700}>My wallet</Text>
                  </div>
                  <Badge size="md">{wallet['coins']} coins</Badge>
                </div>
                <Divider></Divider>
              </Stack>
            </> : null}
            <Router />
          </div>
        </WalletContext.Provider>
      </AuthContext.Provider>
    </MantineProvider>
  );
}