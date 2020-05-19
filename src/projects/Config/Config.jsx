import React, { Component } from 'react'
import Container from '@icedesign/container'
import { Input, Button, Icon } from '@alifd/next'
import './Config.scss'
import { callHttp } from '@/common/index'
import SuperGif from '@/common/libgif.js'
import GIF from '@/common/gif.js'
import { gifToFrames, mkImgGif } from '@/common/generate'
import { data as fontData } from '@/common/data'

var gif = new GIF({
    workers: 2,
    quality: 10,
    workerScript: './gif.worker.js'
});

let img = require('@/images/1.gif')
let width = 658
let height = 494

export default class Config extends Component {
    constructor(props) {
        super(props);
        this.state = {
            start: [10, 50],
            end: [200, 250],
            scaleStart: 1,
            scaleEnd: 2,
            rotateStart: 0,
            rotateEnd: Math.PI * 2
        };
        this.data = {
            url: ''
        }
    }
    render() {
        let { url } = this.state
        return (
            <div className="page-container">
                <Container>
                    <img id="gifImg" onLoad={this.getImgInfo} />
                    {url && <img src={url} />}
                    <Input htmlType="file" onChange={this.addFile} />
                </Container>
            </div>
        )
    }

    getImgInfo = e => {
        console.dir(e.target)
    }

    addFile = async (a, e) => {
        let file = e.target.files[0]
        var reader = new FileReader();
        reader.readAsDataURL(file);
        let base64Url = await new Promise(resolve => {
            reader.onload = function (e) {
                resolve(e.target.result)
            }
        })
        const res = await mkImgGif({
            imgs: [{ url: base64Url, isGif: /.*\.gif$/.test(file.name) }],
            texts: [11],
            templates: fontData
        })
        console.log(res)
    }

    generate(list) {
        let { start, end, scaleStart, scaleEnd, rotateStart, rotateEnd } = this.state
        let len = list.length
        let addX = (end[0] - start[0]) / len
        let addY = (end[1] - start[1]) / len
        let addScale = (scaleEnd - scaleStart) / len
        var j = 0;
        let addRotate = (rotateEnd - rotateStart) / len

        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext('2d');

        gif.on('finished', blob => {
            this.setState({
                url: URL.createObjectURL(blob)
            })
        })
        for (let i = 0; i < list.length; i++) {
            let imgImage = new Image();
            imgImage.src = list[i];
            imgImage.onload = function (e) {
                //Canvas绘制图片
                canvas.width = width;
                canvas.height = height;

                //铺底色
                ctx.drawImage(imgImage, 0, 0, width, height);

                ctx.fillStyle = "#fff";
                let scale = scaleStart + addScale * i
                ctx.font = `${40 * scale}px Arial`;
                var txt = "Hello World"
                let { width: wT } = ctx.measureText(txt)
                ctx.translate(start[0] + wT * scale / 2, start[1] + 20)
                let r = rotateStart + addRotate * i
                ctx.rotate(r, r)
                ctx.fillText(txt, start[0], start[1])

                gif.addFrame(canvas, { copy: true, delay: 100 });
                ctx.clearRect(0, 0, width, height);
                j++;
                //图片
                if (j >= len) {
                    gif.render()
                };
            }
        }
    }
}