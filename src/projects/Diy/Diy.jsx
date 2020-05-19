import React, { useState } from 'react'
import Container from '@icedesign/container'
import { Input, Button, Icon, Checkbox, Select, Message,Notification } from '@alifd/next'
import './Diy.scss'
import { callHttp } from '@/common'
import { CusIcon } from '@/components/CusIcon'
const showSuccess = () => Message.success('上传成功了！！！');
const openNotification = (content) => {
    const args = {
        title: '上传进度提示',
        content,
        duration: 4500,
    };
    Notification.open(args);
};
const dataSource = [{
    label: '暴漫',
    value: 1
}]


function Diy() {
    let [texts, setTexts] = useState([])
    let [text, setText] = useState('')
    let [templates, setTimplates] = useState([
        // {
        //     name: '0',
        //     isSelected: true,
        //     background: require('@/images/face-g/background.png'),
        //     x: 0,
        //     y: 0,
        //     scale: 1,
        //     deg: 0,
        // },
        {
            name: '0',
            isSelected: true,
            background: require('@/images/face-g/face/01.jpg'),
            x: 152,
            y: 171,
            scale: 0.95,
            deg: 0,
            yText: 286
        },
        {
            name: '0',
            isSelected: true,
            background: require('@/images/face-g/face/02.jpg'),
            x: 139,
            y: 134,
            scale: 1,
            deg: 0,
            yText: 280
        },
        {
            name: '0',
            isSelected: true,
            background: require('@/images/face-g/face/03.jpg'),
            x: 149,
            y: 148,
            scale: 1.06,
            deg: 0,
            yText: 280
        },
        {
            name: '0',
            isSelected: true,
            background: require('@/images/face-g/face/04.jpg'),
            x: 153.5,
            y: 176,
            scale: 1.16,
            deg: -8.79,
            yText: 50
        },
        {
            name: '0',
            isSelected: true,
            background: require('@/images/face-g/face/05.jpg'),
            x: 154,
            y: 116,
            scale: 0.85,
            deg: 0,
            yText: 280
        },
        {
            name: '0',
            isSelected: true,
            background: require('@/images/face-g/face/06.jpg'),
            x: 148,
            y: 159,
            scale: 1.15,
            deg: 0,
            yText: 290
        },
        {
            name: '0',
            isSelected: true,
            background: require('@/images/face-g/face/07.jpg'),
            x: 147,
            y: 164,
            scale: 1.12,
            deg: 0,
            yText: 280
        },
        {
            name: '0',
            isSelected: true,
            background: require('@/images/face-g/face/08.jpg'),
            x: 153,
            y: 149,
            scale: 1,
            deg: 0,
            yText: 280
        },
        {
            name: '0',
            isSelected: true,
            background: require('@/images/face-g/face/09.jpg'),
            x: 150,
            y: 150,
            scale: 1,
            deg: 0,
            yText: 280
        },
        {
            name: '10',
            isSelected: true,
            background: require('@/images/face-g/face/10.jpg'),
            x: 137,
            y: 133,
            scale: 1,
            deg: 0,
            yText: 280
        },
    ])
    let [faceTemp, setFaceTemp] = useState([
        {
            name: '0',
            isSelected: true,
            face: require('@/images/face-g/face.png')
        },
        {
            name: '1',
            isSelected: true,
            face: require('@/images/face-g/face1.png')
        },
        {
            name: '2',
            isSelected: true,
            face: require('@/images/face-g/face2.png')
        },
        {
            name: '3',
            isSelected: true,
            face: require('@/images/face-g/face3.png')
        },
    ])
    let [generates, setGenerates] = useState([])
    let [checked1, setChecked1] = useState(true)
    let [checked2, setChecked2] = useState(true)
    let imgData = [];
    let [isAllLineFeed,setAllLineFeed] = useState(false);
    let [isAllpic,setIsAllpic] = useState(true);
    let [lineFeed,setLineFeed] = useState(false);
    let [sFeed,setSfeed] = useState(false);
    let [isSpaceFeed,setSpaceFeed] = useState(false);
    let generateImg = () => {
        let backgroundData = templates.filter((item) => {
            return item.isSelected
        })
        if (backgroundData.length == 0) {
            Message.error('请选择脸部背景')
            return false;
        }
        let faceData = faceTemp.filter((item) => {
            return item.isSelected
        })
        if (faceData.length == 0) {
            Message.error('请选择脸部')
            return false;
        }
        if (texts.length == 0) {
            Message.error('请添加文字')
            return false
        }
        generateData(backgroundData, faceData, texts);
    }
    let generateData = async (backgroundData, faceData, texts) => {
        let lastData = [];
        const myCanvas = document.createElement('canvas');
        myCanvas.width = 300;
        myCanvas.height = 300;
        const ctx = myCanvas.getContext('2d')
        for (let i = 0; i < backgroundData.length; i++) {
            for (let y = 0; y < faceData.length; y++) {
                for (let z = 0; z < texts.length; z++) {
                    await drawBackground(ctx, backgroundData[i].background)
                    await drawFace(ctx, faceData[y].face,backgroundData[i].x,backgroundData[i].y,backgroundData[i].scale,backgroundData[i].deg)
                    drawText(myCanvas, ctx, texts[z], z, texts.length,backgroundData[i].yText)
                    if ((i + 1) * (z + 1) * (y + 1) === texts.length * faceData.length * backgroundData.length) {
                        let tempData = [];
                        for(let i = 0;i < texts.length;i++){
                            for(let j = 0;j < imgData.length;j++){
                                if(texts[i] == imgData[j].textinfo){
                                    tempData.push(imgData[j])
                                }
                            }
                        }
                        setGenerates(tempData)
                    }
                }
            }
        }
        return lastData
    }
    let drawBackground = (ctx, background, x,y) => {
        return new Promise((resolve) => {
            let imgObj = new Image()
            imgObj.src = background
            imgObj.onload = () => {
                ctx.drawImage(imgObj, 0, 0);
                resolve()
            }
        })
    }
    let drawFace = (ctx, face, x,y,scales,deg) => {
        return new Promise((resolve) => {
            let imgObj2 = new Image()
            imgObj2.src = face
            imgObj2.onload = () => {
                ctx.save()
                if(deg!==0){
                    ctx.translate(-(x - 80 * scales)/2,24);
                    ctx.rotate(deg* Math.PI / 180);
                    // ctx.translate(-(x - 40)/2,-(y - 40)/2);
                }

                ctx.drawImage(imgObj2, (x - 40 * scales), (y - 40 * scales),80 * scales,80 * scales);
                ctx.restore();
                resolve()
            }
        })
    }
    let drawText = (myCanvas, ctx, text, z, len,yText) => {
        ctx.font = "36px Arial";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.fillText(text, 150, yText)
        let url = myCanvas.toDataURL("image/png")
        ctx.clearRect(0, 0, 300, 300);
        imgData.push({
            isSelected: true,
            classify: 1,
            base64: url.replace(/^data:image\/\w+;base64,/, ""),
            textinfo: text,
            img: url
        })
    }

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
    let uploadAllData = () => {
        let i = 0;
        let generatesTemplates = generates.filter(item => item.isSelected)
        if(generatesTemplates.length==0){
            Message.error('暂无上传数据,请选择或者制作数据！！！')
            return false;
        }
        let lastData = sliceArr(generatesTemplates)
        let len = lastData.length;
        
        middleUp(i, len,lastData)
    }
    let middleUp = (i, len,lastData) => {
        console.log(i, len)
        if (i >= len) {
            openNotification(`上传完成！！！`)
            showSuccess()
            return false;
        }
        lastUp(i, len,lastData)

    }
    let lastUp = async (i, len,lastData) => {
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
            middleUp(i, len,lastData)
        }
    }
    let uploadImg = async (e)=>{
        let Afile = e.target.files;
        let newFiles = [];
        if(Afile.length > 0){
            for(let i=0;i< Afile.length;i++){
                console.log(Afile[i])
                let reader = new FileReader();
                reader.readAsDataURL(Afile[i])
                await new Promise(resolve=>{
                    reader.onload = (e) => {
                        newFiles.push({
                            name: `upload${i}`,
                            isSelected: true,
                            face: e.target.result
                        })
                        resolve()
                    }
                })
            }
        }
        console.log(faceTemp,newFiles)
        let faceTemps = faceTemp.concat(newFiles)
        console.log(faceTemps)
        setFaceTemp(faceTemps)
    }
    return <div className="diy text-page">
        <div className="label-box mt10">
            <span className="label-box-left">外形模板样式</span>
            <Checkbox checked={checked1} onChange={(checked1) => {
                setChecked1(checked1)
                setTimplates(templates.map((item, index) => {
                    return {
                        ...item,
                        isSelected: checked1
                    }
                }
                ))
            }}>全选样式</Checkbox>
        </div>
        <div className="text-style-list">
            {templates.map((item, index) => {
                let { name, isSelected } = item
                return (
                    <div className="text-style-item" key={index} onClick={
                        () => {
                            setTimplates(templates.map((item, nowIndex) => nowIndex === index ? { ...item, isSelected: !item.isSelected } : item))
                        }
                    }>
                        <img src={item.background} alt={item.name} />
                        <CusIcon className="text-style-item-icon" type={isSelected ? "selected" : "unselected"} />
                    </div>
                )
            })}
        </div>
        <div className="label-box" style={{justifyContent: "space-between"}}>
            <div style={{display:"flex"}}>
                <span className="label-box-left" style={{marginRight: 10}}>脸部模板样式</span>
                <div className="uploadWrap">
                    <input type="file" className="uploadtrans" accept="image/*" multiple onChange={(e)=>{
                        let event = { ...e };
                        uploadImg(event)
                    }}/>
                    <Button className="uploadBtn">上传图片</Button>
                </div>
            </div>
            <Checkbox checked={checked2} onChange={(checked2) => {
                setChecked2(checked2)
                setFaceTemp(
                    faceTemp.map((item, index) => {
                        return {
                            ...item,
                            isSelected: checked2
                        }
                    }
                    ))
            }}>全选样式</Checkbox>
        </div>
        <div className="text-style-list">
            {faceTemp.map((item, index) => {
                let { name, isSelected } = item
                return (
                    <div className="text-style-item text-style-item-ts" key={index} onClick={
                        () => {
                            setFaceTemp(faceTemp.map((item, nowIndex) => nowIndex === index ? { ...item, isSelected: !item.isSelected } : item))
                        }
                    }>
                        <img src={item.face} alt={item.name} />
                        <CusIcon className="text-style-item-icon" type={isSelected ? "selected" : "unselected"} />
                    </div>
                )
            })}
        </div>
        <span className="label-box-left">
            文字字段
            </span>
        <div className="mt10">
            <Input.TextArea placeholder="请输入文字" value={text} onChange={
                (text) => {
                    setText(text)
                }
            } onKeyUp={(e) => {
                if (e.keyCode === 13) {
                    if (text != "") {
                        text = text.replace(/(^\s*)|(\s*$)/g, "")
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
                        setTexts(
                            texts.concat(textArr)
                        )
                        setText('')
                    }
                }
            }} />
            <Button type="primary" className="add" onClick={
                () => {
                    if (text != "") {
                        text = text.replace(/(^\s*)|(\s*$)/g, "")
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
                        setTexts(
                            texts.concat(textArr)
                        )
                        setText('')
                    }
                }
            }>添加文字</Button>
            <Button onClick={()=>{
                setTexts([])
            }} style={{marginLeft: 10}}>一键清除文字</Button>
            <Checkbox style={{marginLeft: 10}} checked={isAllLineFeed} onChange={(isAllLineFeed)=>{
                setAllLineFeed(isAllLineFeed)
            }}>空格隔开</Checkbox>
            <Checkbox style={{marginLeft: 10}} checked={isSpaceFeed} onChange={(isSpaceFeed)=>{
                setSpaceFeed(isSpaceFeed)
            }}>换行隔开</Checkbox>
            <Checkbox style={{marginLeft: 10}} checked={lineFeed} onChange={(lineFeed)=>{
                setLineFeed(lineFeed)
            }}>| 隔开</Checkbox>
            <Checkbox style={{marginLeft: 10}} checked={sFeed} onChange={(sFeed)=>{
                setSfeed(sFeed)
            }}>$ 隔开</Checkbox>
        </div>
        
        <div className="texts">
            {texts.map((item, index) => {
                return (
                    <div className="texts-item" key={index}>
                        {item}
                        <Icon className="texts-item-icon" type="delete-filling" onClick={() => {
                            setTexts(texts.filter((ite, i) => {
                                return i !== index
                            }))
                        }} />
                    </div>
                )
            })}
        </div>
        <div className="generate-btn mt10">
            <Button type="primary" size="large" onClick={
                () => {
                    generateImg()
                }
            }>一键生成</Button>
        </div>
        <div className="label-box">
            <span className="label-box-left">生成结果</span>
            <Checkbox checked={isAllpic} onChange={(isAllpic)=>{
                if(generates.length===0){
                    return false;
                }
                setGenerates(generates.map((item,index)=>{
                    return {
                        ...item,
                        isSelected: isAllpic,
                    }
                }))
                setIsAllpic(isAllpic)
            }}>全选</Checkbox>
        </div>
        <div className="generate-list">
            {generates.map((item, index) => {
                let { textinfo, isSelected, classify, img } = item
                return (
                    <div className="generate-item" key={index} onClick={
                        () => {
                            setGenerates(generates.map((item, nowIndex) => nowIndex === index ? { ...item, isSelected: !item.isSelected } : item))
                        }
                    }>
                        <img src={img} />
                        <Input className="generate-input" placeholder="添加关键字" value={textinfo}
                            onChange={(e) => {
                                setGenerates(generates.map((item, nowIndex) => nowIndex === index ? { ...item, textinfo: e } : item))
                            }}
                        />
                        <Select dataSource={dataSource} className="generate-select" placeholder="分类" value={classify} />
                        <CusIcon className="text-style-item-icon" type={isSelected ? "selected" : "unselected"} />
                    </div>
                )
            })}
        </div>
        <div className="btns">
            <Button size="large" type="primary" onClick={uploadAllData}>上传到SDK库</Button>
            <Button size="large">下载到本地</Button>
        </div>
    </div >
}
export default Diy;