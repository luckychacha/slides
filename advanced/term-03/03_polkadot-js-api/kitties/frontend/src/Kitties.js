import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import { useSubstrate } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import KittyCards from './KittyCards'

export default function Kitties (props) {
  const { api, keyring } = useSubstrate()
  const { accountPair } = props

  const [kitties, setKitties] = useState([])
  const [status, setStatus] = useState('')

  const [dnas, setDnas] = useState([])
  const [owners, setOwners] = useState([])

  const fetchKitties = () => {
    // TODO: 在这里调用 `api.query.kittiesModule.*` 函数去取得猫咪的信息。
    // 你需要取得：
    //   - 共有多少只猫咪
    //   - 每只猫咪的主人是谁
    //   - 每只猫咪的 DNA 是什么，用来组合出它的形态
    // let unsub = null

    let unsubCount = null
    let unsubDna = null
    let unsubOwner = null

    const asyncFetch = async () => {
      unsubCount = await api.query.kittiesModule.kittiesCount(async (res) => {
        const count = res.isNone ? 0 : res.value.toNumber()

        const indexes = Array.from(Array(count).keys())

        unsubDna = await api.query.kittiesModule.kitties.multi(indexes, res => {
          setDnas(res.map((dna, key) => dna.value))
        })
        unsubOwner = await api.query.kittiesModule.owner.multi(indexes, owners => {
          setOwners(owners.map(owner => owner.toHuman()))
        })
      })
    }

    asyncFetch()

    return () => {
      unsubCount && unsubCount() && unsubDna && unsubDna() && unsubOwner && unsubOwner()
    }
  }

  const populateKitties = () => {
    // TODO: 在这里添加额外的逻辑。你需要组成这样的数组结构：
    //  ```javascript
    //  const kitties = [{
    //    id: 0,
    //    dna: ...,
    //    owner: ...
    //  }, { id: ..., dna: ..., owner: ... }]
    //  ```
    // 这个 kitties 会传入 <KittyCards/> 然后对每只猫咪进行处理
    setKitties(dnas.map((dna, key) => {
      return {
        id: key,
        dna: dna,
        owner: owners[key]
      }
    }))
  }

  useEffect(fetchKitties, [api, keyring])
  useEffect(populateKitties, [dnas, owners])

  return <Grid.Column width={16}>
    <h1>小毛孩</h1>
    <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus}/>
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='创建小毛孩' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'kittiesModule',
            callable: 'create',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>
}
