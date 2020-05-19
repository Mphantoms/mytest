import React, { Component } from 'react'
import Container from '@icedesign/container'
import { Input, Button, Icon, Checkbox, Select, Message,Notification } from '@alifd/next'
import './Text.scss'
import { callHttp } from '@/common'
import { CusIcon } from '@/components/CusIcon'
import { mkFontgif,loadFonts,mkPng } from '@/common/generate'
import { data as fontData } from '@/common/data'
const showSuccess = () => Message.success('上传成功了！！！');
let duration = 4500;
const openNotification = (content) => {
    const args = {
        title: '上传进度提示',
        content,
        duration,
    };
    Notification.open(args);
};
let templates = fontData.map((item,index) => {
    return {
        name: '样式一',
        isSelected: true,
        url: require(`@/images/model/${index+1}.gif`),
        ...item
    }
})
const dataSource = [{
    label: '纯文字表情',
    value: 9
}]
let sliceArr = (e) => {
    let proportion = 10; //按照比例切割
    let num = 0;
    let _data = [];
    for (let i = 0; i < e.length; i++) {
        if (i % proportion == 0 && i != 0) {
            _data.push(e.slice(num, i));
            num = i;
        }
        if ((i + 1) == e.length) {
            _data.push(e.slice(num, (i + 1)));
        }
    }
    return _data;
}

export default class Config extends Component {
    constructor(props) {
        super(props);
        this.state = {
            texts: [],
            templates,
            generates: [],
            isAll: true,
            count: 0,
            text: "",
            loading: false,
            uploading: false,
            isAllLineFeed: false,
            isAllpic: true,
            sFeed: false,
            lineFeed: false,
            isSpaceFeed: false,
        }
    }
    componentDidMount(){
        loadFonts()
    }
    inputChange = val => {
        this.setState({
            text: val
        })
    }
    initTexts = ()=>{
        this.setState({
            texts: []
        })
    }
    add = () => {
        let { text,isAllLineFeed,sFeed,lineFeed,isSpaceFeed } = this.state;
        if(text == ""){
            return false
        }
        let textArr = text;
        if(isAllLineFeed){
            textArr = text.split(' ');
        }
        if(lineFeed){
            textArr = text.split('|');
        }
        if(sFeed){
            textArr = text.split('$');
        }
        if(isSpaceFeed){
            textArr = text.split('\n');
        }
        let { texts } = this.state
        texts = texts.concat(textArr)
        this.setState({
            texts,
            text: ''
        })
    }
    addFont = (e) => {
        if (e.keyCode === 13) {
            let { text,isAllLineFeed,sFeed,lineFeed,isSpaceFeed } = this.state;
            if(text == ""){
                return false
            }
            let textArr = text;
            if(isAllLineFeed){
                textArr = text.split(' ');
            }
            if(lineFeed){
                textArr = text.split('|');
            }
            if(sFeed){
                textArr = text.split('$');
            }
            if(isSpaceFeed){
                textArr = text.split('\n');
            }
            let { texts } = this.state
            texts = texts.concat(textArr)
            this.setState({
                texts,
                text: ''
            })
        }
    }
    del = (index) => {
        let { texts } = this.state
        texts.splice(index, 1)
        this.setState({
            texts
        })
    }
    selectBatch = () => {
        let { templates, isAll } = this.state
        isAll = !isAll
        templates.forEach(item => {
            item.isSelected = isAll
        })
        this.setState({
            templates,
            isAll
        })
    }
    selectStyle = (index) => {
        let { templates } = this.state
        templates[index].isSelected = !templates[index].isSelected
        this.setState({
            templates
        })
    }
    selectGenerate = (index) => {
        let { generates } = this.state
        generates[index].isSelected = !generates[index].isSelected
        this.setState({
            generates
        })
    }
    generate = async () => {
        this.setState({
            generates: [],
            loading: true
        })
        let { setCount } = this
        let { texts, templates } = this.state
        let selectedTemplates = templates.filter(item => item.isSelected)
        if (!texts.length || !templates.length) {
            Message.warning('请添加文字，选则模板！')
            this.setState({
                loading: false
            })
            return
        }
        if(selectedTemplates.length==0){
            Message.warning('请选择文字模板！')
            this.setState({
                loading: false
            })
            return
        }
        let urls = await mkFontgif(texts, selectedTemplates, setCount)
        // let urls = mkPng(texts, selectedTemplates);
        this.setState({
            generates: urls.map((item, index) => {
                let { url, text: textinfo,classify,isSelected } = item
                return {
                    isSelected,
                    url,
                    classify,
                    base64: url.replace(/^data:image\/\w+;base64,/, ""),
                    textinfo,
                }
            }),
            loading: false
        })
    }
    setCount = (count) => {
        this.setState({
            count
        })
    }
    uploadAllData = () => {
        this.setState({
            uploading: true
        })
        let { generates } = this.state;
        let generatesTemplates = generates.filter(item => item.isSelected)
        if(generatesTemplates.length==0){
            this.setState({
                uploading: false
            })
            Message.error('必须选择图片上传')
            return false;
        }
        let i = 0;
        let lastData = sliceArr(generatesTemplates)
        let len = lastData.length;
        this.middleUp(i, len, lastData)
    }
    middleUp = (i, len, lastData) => {
        console.log(i, len)
        if (i >= len) {
            this.setState({
                uploading: false
            })
            openNotification(`上传完成！！！`)
            showSuccess()
            return false;
        }
        this.lastUp(i, len, lastData)

    }
    lastUp = async (i, len, lastData) => {
        console.log(lastData)
        let opt = {
            url: '/upload_tools_pic',
            data: {
                value: JSON.stringify(lastData[i])
            }
        }
        let res = await callHttp(opt);
        if (res) {
            openNotification(`已上传${res.length}张`)
            i++
            this.middleUp(i, len, lastData)
        }
    }
    updateText(index, val) {
        let { generates } = this.state
        generates[index].text = val
        this.setState({
            generates
        })
    }
    linefeedChange = (isAllLineFeed)=>{
        this.setState({
            isAllLineFeed
        })
    }
    selectGpic = (isAllpic)=> {
        let { generates } = this.state;
        if(generates.length===0){
            return false;
        }
        this.setState({
            isAllpic,
            generates: generates.map((item,index)=>{
                return {
                    ...item,
                    isSelected: isAllpic,
                }
            })
        })
    }
    spaceChange = (isSpaceFeed)=>{
        this.setState({
            isSpaceFeed
        })
    }
    render() {
        let { texts, templates, isAll, generates, count,text,loading,uploading,isAllLineFeed,isAllpic,lineFeed,sFeed,isSpaceFeed } = this.state
        let { spaceChange,selectGpic,selectGenerate, inputChange, add, del, selectBatch, selectStyle, generate, uploadAllData, updateText,addFont,linefeedChange,initTexts } = this
        let l1 = texts.length
        let l2 = templates.length
        return (
            <div className="text-page">
                <span className="label-box-left">
                    文字字段
                </span>
                <div className="mt10">
                    <Input.TextArea placeholder="请输入文字" value={text} onChange={inputChange} onKeyUp={addFont}/>
                    <Button type="primary" className="add" onClick={add}>添加文字</Button>
                    <Button onClick={initTexts} style={{marginLeft: 10}}>一键清除文字</Button>
                    <Checkbox style={{marginLeft: 10}} checked={isAllLineFeed} onChange={linefeedChange}>空格隔开</Checkbox>
                    <Checkbox style={{marginLeft: 10}} checked={isSpaceFeed} onChange={spaceChange}>换行隔开</Checkbox>
                    <Checkbox style={{marginLeft: 10}} checked={lineFeed} onChange={(lineFeed)=>{
                        this.setState({
                            lineFeed
                        })
                    }}>| 隔开</Checkbox>
                    <Checkbox style={{marginLeft: 10}} checked={sFeed} onChange={(sFeed)=>{
                        this.setState({
                            sFeed
                        })
                    }}>$ 隔开</Checkbox>
                </div>
                <div className="texts">
                    {texts.map((item, index) => {
                        return (
                            <div className="texts-item" key={index}>
                                {item}
                                <Icon className="texts-item-icon" type="delete-filling" onClick={del.bind(this, index)} />
                            </div>
                        )
                    })}
                </div>
                <div className="label-box">
                    <span className="label-box-left">文字模板样式</span>
                    <Checkbox checked={isAll} onChange={selectBatch}>全选样式</Checkbox>
                </div>
                <div className="text-style-list">
                    {templates.map((item, index) => {
                        let { name, isSelected,url, } = item
                        return (
                            <div className="text-style-item" key={index} onClick={selectStyle.bind(this, index)}>
                                <img src={url} alt={name} />
                                <CusIcon className="text-style-item-icon" type={isSelected ? "selected" : "unselected"} />
                            </div>
                        )
                    })}
                </div>
                <div className="generate-btn">
                    {count ? <div>{count}/{l1 * l2}</div> : null}
                    <Button type="primary" size="large" onClick={generate} loading={loading}>一键生成</Button>
                </div>
                <div className="label-box">
                    <span className="label-box-left">生成结果</span>
                    <Checkbox checked={isAllpic} onChange={selectGpic}>全选</Checkbox>
                </div>
                <div className="generate-list">
                    {generates.map((item, index) => {
                        let { isSelected, url, classify,textinfo } = item
                        return (
                            <div className="generate-item" key={index} >
                                <img onClick={selectGenerate.bind(this, index)} src={url} />
                                <Input className="generate-input" value={textinfo} placeholder="添加关键字" onChange={updateText.bind(this, index)} />
                                <Select dataSource={dataSource} className="generate-select" value={classify} placeholder="分类" />
                                <CusIcon className="text-style-item-icon" type={isSelected ? "selected" : "unselected"} />
                            </div>
                        )
                    })}
                </div>
                <div className="btns">
                    <Button size="large" type="primary" onClick={uploadAllData} loading={uploading}>上传到SDK库</Button>
                    <Button size="large">下载到本地</Button>
                </div>
            </div >
        )
    }
}