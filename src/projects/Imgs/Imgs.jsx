import React, { useState } from 'react'
import Container from '@icedesign/container'
import { Input, Button, Icon,Checkbox,Select } from '@alifd/next'
import './Imgs.scss'
import { callHttp } from '@/common'
import { CusIcon } from '@/components/CusIcon'
import { gifToFrames, mkImgGif } from '@/common/generate'
import { data as fontData } from '@/common/data'
// const res = await mkImgGif({
//     imgs: [{ url: base64Url, isGif: /.*\.gif$/.test(file.name) }],
//     texts: [11],
//     templates: fontData
// })
function Imgs(){
    let [diyName,setDiyName] = useState('')
    let [okName,setOkName] = useState('')
    let [texts,setTexts] = useState([
        // {
        //     name: '1111',
        //     isSelected: true
        // }
    ])
    let [templates,setTemplates] = useState([
        {
            name: '1111',
            isSelected: true
        }
    ])
    let [generates,setGenerates] = useState([
        {
            name: '1111',
            isSelected: true
        }
    ])
    let [files,setFiles] = useState([])
    let anaFile = [];
    let i = 0;
    let upLoadFiles = [];
    let previewImg = async (i,filees,ev,len) => {
        let file = filees[i];
        let isGif= /.*\.gif$/.test(filees[i].name)
        let reader = new FileReader();
        let img = new Image();
        let dataObj = {}
        reader.readAsDataURL(file)
        await new Promise(resolve=>{
            reader.onload = (e) => {
                img.src = e.target.result;
                dataObj.url = e.target.result
                dataObj.base64 = e.target.result.replace(/^data:image\/\w+;base64,/, "")
                dataObj.isGif = isGif
                resolve()
            }
        })
        await new Promise((resolve)=>{
            img.onload = () => {
                dataObj.imgObj = img
                anaFile.push(dataObj)

                i++;
                setFile(i,filees,ev,len)
                resolve()
            }
        })
    }
    let uploadImg = (e) => {
        let Afile = e.target.files;
        let len = Afile.length;
        setFile(i,Afile,e,len)
    }

    let setFile = async (i,Afile,ev,len)=>{
        console.log(i,len)
        if(i>=len){
            setFiles(anaFile)
            return false;
        }
        await previewImg(i,Afile,ev,len);
    }

    let generateNow = async () =>{
        let temp = [];
        for(let i = 0; i < files.length; i++){
            const res = await gifToFrames(files[i].url)
            temp.push(res)
        }
        upLoadFiles = temp
        // setGenerates(res)
    }
    let uploadSDK = async () => {
        let data = await callHttp({
            url: '/data',
            data: {
                arr: JSON.stringify(upLoadFiles)
            }
        });
        if(data){
            console.log(data);
        }
    }
    return <div className="text-page">
            <div className="label-box mt10">
                <span className="label-box-left">上传图片</span>
                <div className="uploadWrap">
                    <input type="file" className="uploadtrans" accept="image/*" multiple onChange={(e)=>{
                        let event = { ...e };
                        uploadImg(event)
                    }}/>
                    <Button className="uploadBtn">上传图片</Button>
                </div>
                
            </div>
            <div className="text-style-list">
                {files.map((item, index) => {
                    return (
                        <div className="text-style-item" key={index} >
                            <img src={item.url} alt=""/>
                        </div>
                    )
                })}
            </div>
            <div className="label-box">
                <span className="label-box-left">文字模板样式</span>
                <Checkbox>全选样式</Checkbox>
            </div>
            <div className="text-style-list">
                {templates.map((item, index) => {
                    let { name, isSelected } = item
                    return (
                        <div className="text-style-item" key={index}>
                            {name}
                            <CusIcon className="text-style-item-icon" type={isSelected ? "selected" : "unselected"} />
                        </div>
                    )
                })}
            </div>
            <span className="label-box-left">
                文字字段
            </span>
            <div className="mt10">
                <Input placeholder="请输入文字" />
                <Button type="primary" className="add">添加文字</Button>
            </div>
            <div className="texts">
                {texts.map((item, index) => {
                    return (
                        <div className="texts-item" key={index}>
                            {item}
                            <Icon className="texts-item-icon" type="delete-filling" />
                        </div>
                    )
                })}
            </div>
            <div className="generate-btn mt10">
                <Button type="primary" size="large" onClick={generateNow}>一键生成</Button>
            </div>
            <div className="generate-list">
                {generates.map((item, index) => {
                    let { text,url } = item
                    return (
                        <div className="generate-item" key={index} >
                            <img src={url}/>
                            <Input className="generate-input" placeholder="添加关键字" value={text} />
                            <Select className="generate-select" placeholder="分类" />
                            <CusIcon className="text-style-item-icon" type={text ? "selected" : "unselected"} />
                        </div>
                    )
                })}
            </div>
            <div className="btns">
                <Button size="large" type="primary" onClick={uploadSDK}>上传到SDK库</Button>
                <Button size="large">下载到本地</Button>
            </div>
        </div >
}
export default Imgs;