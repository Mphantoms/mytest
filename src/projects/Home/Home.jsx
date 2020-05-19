import React, { Component } from 'react'
import Container from '@icedesign/container'
import { Input, Button, Icon, Tab } from '@alifd/next'
import Text from '@/projects/Text'
import Imgs from '@/projects/Imgs'
import Diy from '@/projects/Diy'
import './Home.scss'
import { debugDict,debug } from '@/common/index'
import SuperGif from '@/common/libgif.js'
import GIF from '@/common/gif.js'
const { Login } = debugDict[debug]
var gif = new GIF({
    workers: 2,
    quality: 10,
    workerScript: './gif.worker.js'
});

let img = require('@/images/1.gif')
let width = 658
let height = 494

const tabs = [
    { tab: '纯文字表情', key: '0' },
    // { tab: '图片批量加字', key: '1', },
    { tab: 'DIY组合表情', key: '1', },
]

export default class Config extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: tabs[1].key
        }
    }
    componentDidMount(){
        let uid = localStorage.getItem('uid')
        let token = localStorage.getItem('token')
        if (!uid || !token) {
            window.open(Login, '_self')
            return
        }
    }
    onChange = (activeKey) => {
        this.setState({ activeKey });
    }

    render() {
        let { activeKey } = this.state
        let { onChange } = this
        return (
            <div className="page-container">
                <Container className="tab-box">
                    <Tab onChange={onChange}
                        activeKey={activeKey}>
                        {
                            tabs.map(tab => <Tab.Item title={tab.tab} key={tab.key} />)
                        }
                    </Tab>
                </Container>
                <Container className="content">
                    {activeKey == tabs[0].key && <Text />}
                    {/* {activeKey == tabs[1].key && <Imgs />} */}
                    {activeKey == tabs[1].key && <Diy />}
                </Container>
            </div>
        )
    }

}