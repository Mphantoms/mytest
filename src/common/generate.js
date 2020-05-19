import GIF from '@/common/gif.js'
import SuperGif from '@/common/libgif.js'
function getBytesLength(str) {
    // 在GBK编码里，除了ASCII字符，其它都占两个字符宽
    return str.replace(/[^\x00-\xff]/g, 'xx').length;
}
async function mkFontgif(texts, templates, setCount) {
    // let urls = []
    // let count = 0
    // let len1 = texts.length
    // let len2 = templates.length
    // for (let i = 0; i < len1; i++) {
    //     for (let j = 0; j < len2; j++) {
    //         urls.push(await mk(texts[i], templates[j]))
    //     }
    // }
    // return urls
    let allUrls = []
    let urls = []
    let count = 0
    let len1 = texts.length
    let len2 = templates.length
    for (let i = 0; i < len1; i++) {
        for (let j = 0; j < len2; j++) {
            console.log(templates[j].isMark);
            if(!templates[j].isMark){
                urls.push(mk(texts[i], templates[j]))
            }else if(templates[j].isMark < 6 && templates[j].isMark){
                urls.push(mk2(texts[i], templates[j]))
            }else if(templates[j].isMark >= 6 && templates[j].isMark){
                urls.push(mk3(texts[i], templates[j]))
            }
            console.log(urls)
            if (urls.length == len1 * len2 || urls.length === len2) {
                let arr = await Promise.all(urls)
                console.log(arr)
                allUrls = allUrls.concat(arr)
                urls = []
            }
        }
    }
    return allUrls
    function mk(txt, data) {
        return new Promise((resolve) => {
            let gif = new GIF({
                workers: 1,
                quality: 10,
                workerScript: './gif.worker.js'
            });
            console.log(1);
            let { imgW, imgH, fontSize, fontStyle, backgroundStyle, effect, isStopFrame, fontFamily } = data
            let { rotateStart,
                rotateEnd,
                translateStartX,
                translateStartY,
                translateEndX,
                translateEndY,
                translateMediumX,
                translateMediumY,
                scaleStart,
                scaleEnd,
                frameNum,
                frameTime, } = effect
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext('2d');

            gif.on('finished', blob => {        //生成新GIF
                var a = new FileReader();
                a.readAsDataURL(blob);//读取文件保存在result中
                a.onload = function (e) {
                    setCount(++count);
                    gif = null;
                    resolve({ url: e.target.result, text: txt,classify: 9,isSelected: true })
                }
                gif.abort()
            })
            let i = 0

            let len = frameNum
            canvas.width = imgW;
            canvas.height = imgH;
            for (let j = 0; j < frameNum; j++) {
                ani({ ctx, index: j, len, })
                if (j == len - 1 && isStopFrame > 0) {
                    for (let k = 0; k < isStopFrame; k++) {
                        ani({ ctx, index: j, len: len - 1, },k == isStopFrame-29? true: false)
                        gif.addFrame(canvas, { copy: true, delay: frameTime, })
                        if (k == isStopFrame - 1) {
                            isStopFrame = 0;
                        }
                    }
                }
                gif.addFrame(canvas, { copy: true, delay: frameTime, })  //canvas生成帧
                if (++i >= frameNum && isStopFrame == 0) {       //已添加所有帧
                    gif.render()
                }
            }
            
            function ani({ ctx, index, len, },mark) {
                // debugger
                let fontSizeTemp = fontSize;
                if(txt.length > 7){
                    fontSizeTemp = Math.ceil(fontSize * 7 / txt.length * 0.92)
                    if(/^[0-9a-zA-Z]+$/.test(txt)){
                        if(txt.length > 14){
                            fontSizeTemp = Math.floor(fontSize * 7 / txt.length * 1.85)
                        }
                    }
                }
                let rotateVal = rotateStart + index * (rotateEnd - rotateStart) / len
                ctx.font = `${fontSizeTemp}px '${fontFamily}'`
                let scaleVal = scaleStart + index * (scaleEnd - scaleStart) / len
                let { width: wText } = ctx.measureText(txt)

                let hText = fontSizeTemp
                let xText = translateStartX + index * (translateEndX - translateStartX) / len - (wText / 2)
                if(mark && translateStartX!=translateMediumX){
                    xText = translateStartX + (translateMediumX - translateStartX) - (wText / 2) + 20
                }
                let yText = translateStartY + index * (translateEndY - translateStartY) / len + hText / 2
                if(mark && translateStartY!=translateMediumY){
                    yText = translateMediumY + hText / 2
                }
                ctx.clearRect(0, 0, imgW, imgH)
                ctx.fillStyle = backgroundStyle
                ctx.fillRect(0, 0, imgW, imgH)
                ctx.fillStyle = fontStyle
                ctx.save()          //状态保存，避免多次操作
                ctx.scale(scaleVal, scaleVal)
                ctx.translate(xText + wText / 2, yText - hText / 2)
                let deg = Math.PI / 180 * rotateVal
                ctx.rotate(deg, deg)
                ctx.lineWidth = 8;
                ctx.strokeStyle = '#000';
                ctx.strokeText(txt, -wText / 2, hText / 2);
                ctx.fillText(txt, -wText / 2, hText / 2)
                ctx.restore()           //状态恢复
            }
        })
    }
    function mk2(txt, data) {
        return new Promise((resolve) => {
            let gif = new GIF({
                workers: 1,
                quality: 10,
                workerScript: './gif.worker.js'
            });
            let { imgW, imgH, fontSize, fontStyle, backgroundStyle, effect, isStopFrame, fontFamily,isMark } = data
            let { rotateStart,
                rotateEnd,
                translateStartX,
                translateStartY,
                translateEndX,
                translateEndY,
                translateMediumX,
                translateMediumY,
                scaleStart,
                scaleEnd,
                textBorder,
                frameNum,
                frameTime, } = effect
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext('2d');
            ctx.font = `${fontSize}px '${fontFamily}'`;
            let result = [];
            let shortTimeTemp = txt;
            
            if(isMark===1){
                result = breakLinesForCanvas(txt, 300,ctx);
            }else if(isMark===2){
                shortTimeTemp = txt.replace(/,|，|。/g," ");
                let shortTemp2 = shortTimeTemp.split(' ');
                result = shortTemp2.reverse()
            }else if(isMark===3){
                let shortTemp2 = shortTimeTemp.split(' ');
                result = shortTemp2.reverse()
            }else if(isMark===4){
                if(shortTimeTemp.length>=2){
                    let textLen = Math.floor(shortTimeTemp.length / 2);
                    result.push(shortTimeTemp.slice(textLen,shortTimeTemp.length),shortTimeTemp.slice(0,textLen));
                }else{
                    result.push(shortTimeTemp)
                }
            }else if(isMark===5){
                if(shortTimeTemp.length>=3){
                    let textLen = Math.floor(shortTimeTemp.length / 3);
                    result.push(shortTimeTemp.slice(textLen * 2,shortTimeTemp.length),shortTimeTemp.slice(textLen,textLen * 2),shortTimeTemp.slice(0,textLen));
                }else{
                    result.push(shortTimeTemp)
                }
            }
            // if(txt.indexOf(" ") != -1 || txt.indexOf("，") != -1 || txt.indexOf(",") != -1 || txt.indexOf("。") != -1){
            //     shortTimeTemp = txt.replace(/,|，|。/g," ");
            //     let shortTemp2 = shortTimeTemp.split(' ');
            //     let nextResult = [];
            //     for(let i = 0;i<shortTemp2.length;i++){
            //         if(ctx.measureText(shortTemp2[i]).width > 300){
            //             nextResult.unshift(...(breakLinesForCanvas(shortTemp2[i], 300,ctx)))
            //         }else{
            //             nextResult.unshift(shortTemp2[i]);
            //         }
            //     }
            //     result = nextResult
            // }else{
            //     result = breakLinesForCanvas(txt, 300,ctx);
            // }
            // console.log(result);
            gif.on('finished', blob => {        //生成新GIF
                var a = new FileReader();
                a.readAsDataURL(blob);//读取文件保存在result中
                a.onload = function (e) {
                    setCount(++count);
                    gif = null;
                    resolve({ url: e.target.result, text: txt,classify: 9,isSelected: true })
                }
            })
            let i = 0

            let len = frameNum
            canvas.width = imgW;
            canvas.height = imgH;
            for (let j = 0; j < frameNum; j++) {
                ani({ ctx, index: j, len, })
                if (j == len - 1 && isStopFrame > 0) {
                    for (let k = 0; k < isStopFrame; k++) {
                        ani({ ctx, index: j, len: len - 1, },k == isStopFrame-29? true: false)
                        gif.addFrame(canvas, { copy: true, delay: frameTime, })
                        if (k == isStopFrame - 1) {
                            isStopFrame = 0;
                        }
                    }
                }
                gif.addFrame(canvas, { copy: true, delay: frameTime, })  //canvas生成帧
                if (++i >= frameNum && isStopFrame == 0) {       //已添加所有帧
                    gif.render()
                }
            }
            function breakLinesForCanvas(text, width,ctx) {
                var result = [];
                var breakPoint = 0;
                while ((breakPoint = findBreakPoint(text, width, ctx)) !== -1) {
                    result.unshift(text.substr(0, breakPoint));
                    text = text.substr(breakPoint);
                }
                if (text) {
                    result.unshift(text);
                }
                return result;
            }
            function findBreakPoint(text, width, context) {
                var min = 0;
                var max = text.length - 1;
                
                while (min <= max) {
                    var middle = Math.ceil((min + max) / 2);
                    var middleWidth = context.measureText(text.substr(0, middle)).width;
                    var oneCharWiderThanMiddleWidth = context.measureText(text.substr(0, middle + 1)).width;
                    if (middleWidth <= width && oneCharWiderThanMiddleWidth > width) {
                        return middle;
                    }
                    if (middleWidth < width) {
                        min = middle + 1;
                    } else {
                        max = middle - 1;
                    }
                }
     
                return -1;
            }


            function ani({ ctx, index, len, },mark) {
                // debugger
                let fontSizeTemp = fontSize;
                ctx.font = `${fontSizeTemp}px '${fontFamily}'`;
                // let wText= 300
                // let hText = fontSizeTemp
                let xText = translateStartX + index * (translateEndX - translateStartX) / len
                let yText = translateStartY + index * (translateEndY - translateStartY) / len
                if(mark && translateStartX!=translateMediumX){
                    xText = translateStartX + (translateMediumX - translateStartX)
                }
                if(mark && translateStartY!=translateMediumY){
                    yText = translateMediumY
                }
                ctx.clearRect(0, 0, imgW, imgH)
                ctx.fillStyle = backgroundStyle
                ctx.fillRect(0, 0, imgW, imgH)
                ctx.save()          //状态保存，避免多次操作
                ctx.fillStyle = fontStyle;
                ctx.textAlign = 'center';
                // if(textBorder!==0){
                //     ctx.strokeStyle = '#000';
                //     ctx.lineWidth = 8;
                // }else{
                //     ctx.strokeStyle = '#000';
                //     ctx.lineWidth = 0;
                // }
                if(result.length==1){
                    // ctx.strokeText(result[0], xText, yText + 20);
                    ctx.fillText(result[0], xText, yText + 20);
                }else{
                    result.forEach(function(lineText, i) {
                        // ctx.strokeText(lineText, xText, (yText + (fontSizeTemp * result.length + 40) / 2) - (fontSizeTemp + 20) * i);
                        ctx.fillText(lineText, xText, (yText + (fontSizeTemp * result.length + 40) / 2) - (fontSizeTemp + 20) * i);
                    });
                }
                ctx.restore()           //状态恢复
            }
        })
    }
    function mk3(txt, data) {
        return new Promise((resolve) => {
            let gif = new GIF({
                workers: 1,
                quality: 10,
                workerScript: './gif.worker.js'
            });
            let { imgW, imgH, fontSize, fontStyle, backgroundStyle, effect, isStopFrame, fontFamily,isMark } = data
            let { rotateStart,
                rotateEnd,
                translateStartX,
                translateStartY,
                translateEndX,
                translateEndY,
                translateMediumX,
                translateMediumY,
                scaleStart,
                scaleEnd,
                textBorder,
                frameNum,
                frameTime, } = effect
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext('2d');
            ctx.font = `${fontSize}px '${fontFamily}'`;
            let result = [];
            let shortTimeTemp = txt;
            
            if(isMark===6){
                result = breakLinesForCanvas(txt, 300,ctx);
            }else if(isMark===7){
                shortTimeTemp = txt.replace(/,|，|。/g," ");
                let shortTemp2 = shortTimeTemp.split(' ');
                result = shortTemp2.reverse()
            }else if(isMark===8){
                let shortTemp2 = shortTimeTemp.split(' ');
                result = shortTemp2.reverse()
            }else if(isMark===9){
                if(shortTimeTemp.length>=2){
                    let textLen = Math.floor(shortTimeTemp.length / 2);
                    result.push(shortTimeTemp.slice(textLen,shortTimeTemp.length),shortTimeTemp.slice(0,textLen));
                }else{
                    result.push(shortTimeTemp)
                }
            }else if(isMark===10){
                if(shortTimeTemp.length>=3){
                    let textLen = Math.floor(shortTimeTemp.length / 3);
                    result.push(shortTimeTemp.slice(textLen * 2,shortTimeTemp.length),shortTimeTemp.slice(textLen,textLen * 2),shortTimeTemp.slice(0,textLen));
                }else{
                    result.push(shortTimeTemp)
                }
            }
            // if(txt.indexOf(" ") != -1 || txt.indexOf("，") != -1 || txt.indexOf(",") != -1 || txt.indexOf("。") != -1){
            //     shortTimeTemp = txt.replace(/,|，|。/g," ");
            //     let shortTemp2 = shortTimeTemp.split(' ');
            //     let nextResult = [];
            //     for(let i = 0;i<shortTemp2.length;i++){
            //         if(ctx.measureText(shortTemp2[i]).width > 300){
            //             nextResult.unshift(...(breakLinesForCanvas(shortTemp2[i], 300,ctx)))
            //         }else{
            //             nextResult.unshift(shortTemp2[i]);
            //         }
            //     }
            //     result = nextResult
            // }else{
            //     result = breakLinesForCanvas(txt, 300,ctx);
            // }
            // console.log(result);
            gif.on('finished', blob => {        //生成新GIF
                var a = new FileReader();
                a.readAsDataURL(blob);//读取文件保存在result中
                a.onload = function (e) {
                    setCount(++count);
                    gif = null;
                    resolve({ url: e.target.result, text: txt,classify: 9,isSelected: true })
                }
            })
            let i = 0

            let len = frameNum
            canvas.width = imgW;
            canvas.height = imgH;
            for (let j = 0; j < frameNum; j++) {
                ani({ ctx, index: j, len, })
                if (j == len - 1 && isStopFrame > 0) {
                    for (let k = 0; k < isStopFrame; k++) {
                        ani({ ctx, index: j, len: len - 1, },k == isStopFrame-29? true: false)
                        gif.addFrame(canvas, { copy: true, delay: frameTime, })
                        if (k == isStopFrame - 1) {
                            isStopFrame = 0;
                        }
                    }
                }
                gif.addFrame(canvas, { copy: true, delay: frameTime, })  //canvas生成帧
                if (++i >= frameNum && isStopFrame == 0) {       //已添加所有帧
                    gif.render()
                }
            }
            function breakLinesForCanvas(text, width,ctx) {
                var result = [];
                var breakPoint = 0;
                while ((breakPoint = findBreakPoint(text, width, ctx)) !== -1) {
                    result.unshift(text.substr(0, breakPoint));
                    text = text.substr(breakPoint);
                }
                if (text) {
                    result.unshift(text);
                }
                return result;
            }
            function findBreakPoint(text, width, context) {
                var min = 0;
                var max = text.length - 1;
                
                while (min <= max) {
                    var middle = Math.ceil((min + max) / 2);
                    var middleWidth = context.measureText(text.substr(0, middle)).width;
                    var oneCharWiderThanMiddleWidth = context.measureText(text.substr(0, middle + 1)).width;
                    if (middleWidth <= width && oneCharWiderThanMiddleWidth > width) {
                        return middle;
                    }
                    if (middleWidth < width) {
                        min = middle + 1;
                    } else {
                        max = middle - 1;
                    }
                }
     
                return -1;
            }


            function ani({ ctx, index, len, },mark) {
                // debugger
                let fontSizeTemp = fontSize;
                ctx.font = `${fontSizeTemp}px '${fontFamily}'`;
                // let wText= 300
                // let hText = fontSizeTemp
                let xText = translateStartX + index * (translateEndX - translateStartX) / len
                let yText = translateStartY + index * (translateEndY - translateStartY) / len
                if(mark && translateStartX!=translateMediumX){
                    xText = translateStartX + (translateMediumX - translateStartX)
                }
                if(mark && translateStartY!=translateMediumY){
                    yText = translateMediumY
                }
                ctx.clearRect(0, 0, imgW, imgH)
                ctx.fillStyle = backgroundStyle
                ctx.fillRect(0, 0, imgW, imgH)
                ctx.save()          //状态保存，避免多次操作
                ctx.fillStyle = fontStyle;
                ctx.textAlign = 'center';
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 8;
                if(result.length==1){
                    ctx.strokeText(result[0], xText, yText + 20);
                    ctx.fillText(result[0], xText, yText + 20);
                }else{
                    result.forEach(function(lineText, i) {
                        ctx.strokeText(lineText, xText, (yText + (fontSizeTemp * result.length + 40) / 2) - (fontSizeTemp + 20) * i);
                        ctx.fillText(lineText, xText, (yText + (fontSizeTemp * result.length + 40) / 2) - (fontSizeTemp + 20) * i);
                    });
                }
                ctx.restore()           //状态恢复
            }
        })
    }
}

async function mkImgGif({ imgs, texts, templates, setCount = () => { } }) {
    let allUrls = []
    let urls = []
    let count = 0
    let len1 = texts.length
    let len2 = templates.length
    let len0 = imgs.length
    for (let i = 0; i < len1; i++) {
        for (let j = 0; j < len2; j++) {
            for (let k = 0; k < len0; k++) {
                const { isGif, url } = imgs[k]
                const txt = texts[i]
                const data = templates[j]
                let img = url
                if (isGif) {
                    img = await gifToFrames(url)
                }
                urls.push(
                    mk({ txt, data, img, isGif })
                )
                if (urls.length == 20 || urls.length == len1 * len2) {
                    let arr = await Promise.all(urls)
                    allUrls = allUrls.concat(arr)
                    urls = []
                }
            }
        }
    }
    return allUrls
    function mk({ txt, data, img, isGif }) {
        return new Promise((resolve) => {
            let gif = new GIF({
                workers: 1,
                quality: 10,
                background: '#fff',
                workerScript: './gif.worker.js'
            });

            let { fontSize, fontStyle, backgroundStyle, effect } = data
            let { rotateStart,
                rotateEnd,
                translateStartX,
                translateStartY,
                translateEndX,
                translateEndY,
                scaleStart,
                scaleEnd,
                frameNum,
                frameTime, } = effect
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext('2d');
            ctx.font = `${fontSize}px ${fontFamily}`
            gif.on('finished', blob => {        //生成新GIF
                var a = new FileReader();
                a.readAsDataURL(blob);//读取文件保存在result中
                a.onload = function (e) {
                    setCount(++count)
                    gif = null;
                    resolve({ url: e.target.result, text: txt,type: 9 })
                }
            })
            let i = 0

            let imgW, imgH
            if (isGif) {
                frameNum = img.length
            }
            for (let j = 0; j < frameNum; j++) {
                let imgImage = new Image()
                let delay, url
                if (isGif) {
                    ({ url, delay } = img[j])
                } else {
                    url = img
                }
                imgImage.src = url
                imgImage.onload = function (e) {
                    let { width: imgW, height: imgH } = this

                    canvas.width = imgW;
                    canvas.height = imgH;
                    ctx.drawImage(imgImage, 0, 0, imgW, imgH)
                    ani({ ctx, index: j, len: frameNum, })               //文字
                    gif.addFrame(canvas, { copy: true, delay: delay || frameTime, })  //canvas生成帧
                    if (++i >= frameNum) {       //已添加所有帧
                        gif.render()
                    }
                }
            }
            function ani({ ctx, index, len, }) {
                // debugger
                let rotateVal = rotateStart + index * (rotateEnd - rotateStart) / len
                ctx.font = `${fontSize}px ${fontFamily}`
                
                let scaleVal = scaleStart + index * (scaleEnd - scaleStart) / len
                let { width: wText } = ctx.measureText(txt)
                let hText = fontSize
                let xText = translateStartX + index * (translateEndX - translateStartX) / len + (wText / 2)
                console.log(xText)
                let yText = translateStartY + index * (translateEndY - translateStartY) / len + hText / 2
                ctx.clearRect(0, 0, imgW, imgH)
                ctx.fillStyle = backgroundStyle
                ctx.fillRect(0, 0, imgW, imgH)
                ctx.fillStyle = fontStyle
                ctx.save()          //状态保存，避免多次操作
                ctx.scale(scaleVal, scaleVal)
                ctx.translate(xText + wText / 2, yText - hText / 2)
                let deg = Math.PI / 180 * rotateVal
                ctx.rotate(deg, deg)

                ctx.fillText(txt, -wText / 2, hText / 2)
                ctx.restore()           //状态恢复
            }
        })
    }
}

//GIF生成图片数组,url：base64
async function gifToFrames(url) {
    return new Promise(async resolve => {
        var div = document.createElement("div");
        var img = document.createElement("img");
        div.appendChild(img);
        img.src = url;

        //GIF图片加载
        await new Promise(resolve => {
            img.onload = function () {
                resolve()
            }
        })
        // 新建gif实例
        var rub = new SuperGif({ gif: img });

        //rub加载
        await new Promise(resolve => {
            rub.load(() => resolve())
        })
        const { delays } = rub
        console.log(delays)
        var img_list = [];
        for (var i = 1; i <= rub.get_length(); i++) {
            // 遍历gif实例的每一帧
            rub.move_to(i);

            img_list.push({
                url: rub.get_canvas().toDataURL('image/png', 0.6).split(",")[1],
                delay: delays[i - 1]
            })
        }
        resolve(img_list)
    })
}

let loadFonts = () => {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext('2d');
    ctx.font = `40px kuaile`
    ctx.fillText('111', 10, 10)
    ctx.font = `40px ruizi`
    ctx.fillText('222', 30, 30)
}

let mkPng = (fontTemps,temps) => {
    
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext('2d');
    let allUrl = []
    for(let i = 0;i<fontTemps.length;i++){
        for(let j=0;j<temps.length;j++){
            let data = {
                url: mkFunc(fontTemps[i],temps[j]),
                text: fontTemps[i],
                classify: 9,
                isSelected: true,
            }
            allUrl.push(data)
        }
    }

    function mkFunc(font,data){
        let { imgW, imgH,fontSize, fontStyle, backgroundStyle,fontFamily,textBorder,textBorderColor } = data
        console.log(imgW, imgH)
        canvas.width = imgW;
        canvas.height = imgH;
        ctx.clearRect(0, 0, imgW, imgH)
        ctx.save()
        ctx.fillStyle = backgroundStyle
        ctx.beginPath();
        ctx.fillRect(0, 0, imgW, imgH)
        ctx.closePath();
        ctx.fillStyle = fontStyle
        ctx.font = `${fontSize}px ${fontFamily}`
        ctx.textAlign = 'center';
        ctx.lineWidth = textBorder;
        ctx.strokeStyle = textBorderColor;
        ctx.strokeText(font, imgW / 2, imgH / 2);
        ctx.fillText(font, imgW / 2, imgH / 2)
        ctx.restore()
        return canvas.toDataURL("image/png");
    }
    return allUrl;
}






async function mkFontgif2(texts, templates, setCount) {
    // let urls = []
    // let count = 0
    // let len1 = texts.length
    // let len2 = templates.length
    // for (let i = 0; i < len1; i++) {
    //     for (let j = 0; j < len2; j++) {
    //         urls.push(await mk(texts[i], templates[j]))
    //     }
    // }
    // return urls
    let allUrls = []
    let urls = []
    let count = 0
    let len1 = texts.length
    let len2 = templates.length
    for (let i = 0; i < len1; i++) {
        for (let j = 0; j < len2; j++) {
            urls.push(mk(texts[i], templates[j]))
            console.log(urls)
            if (urls.length == len1 * len2 || urls.length === 12) {
                let arr = await Promise.all(urls)
                console.log(arr)
                allUrls = allUrls.concat(arr)
                urls = []
            }
        }
    }
    return allUrls
    function mk(txt, data) {
        return new Promise((resolve) => {
            let gif = new GIF({
                workers: 1,
                quality: 10,
                workerScript: './gif.worker.js'
            });
            console.log(1);
            let { imgW, imgH, fontSize, fontStyle, backgroundStyle, effect, isStopFrame, fontFamily } = data
            let { rotateStart,
                rotateEnd,
                translateStartX,
                translateStartY,
                translateEndX,
                translateEndY,
                translateMediumX,
                translateMediumY,
                scaleStart,
                scaleEnd,
                frameNum,
                textBorder,
                frameTime, } = effect
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext('2d');
            ctx.font = `${fontSize}px '${fontFamily}'`;
            let result = [];
            let shortTimeTemp = txt;
            if(txt.indexOf(" ") != -1 || txt.indexOf("，") != -1 || txt.indexOf(",") != -1 || txt.indexOf("。") != -1){
                shortTimeTemp = txt.replace(/,|，|。/g," ");
                let shortTemp2 = shortTimeTemp.split(' ');
                let nextResult = [];
                for(let i = 0;i<shortTemp2.length;i++){
                    if(ctx.measureText(shortTemp2[i]).width > 300){
                        nextResult.unshift(...(breakLinesForCanvas(shortTemp2[i], 300,ctx)))
                    }else{
                        nextResult.unshift(shortTemp2[i]);
                    }
                }
                result = nextResult
            }else{
                result = breakLinesForCanvas(txt, 300,ctx);
            }
            console.log(result);
            gif.on('finished', blob => {        //生成新GIF
                var a = new FileReader();
                a.readAsDataURL(blob);//读取文件保存在result中
                a.onload = function (e) {
                    setCount(++count);
                    gif = null;
                    resolve({ url: e.target.result, text: txt,classify: 9,isSelected: true })
                }
            })
            let i = 0

            let len = frameNum
            canvas.width = imgW;
            canvas.height = imgH;
            for (let j = 0; j < frameNum; j++) {
                ani({ ctx, index: j, len, })
                if (j == len - 1 && isStopFrame > 0) {
                    for (let k = 0; k < isStopFrame; k++) {
                        ani({ ctx, index: j, len: len - 1, },k == isStopFrame-29? true: false)
                        gif.addFrame(canvas, { copy: true, delay: frameTime, })
                        if (k == isStopFrame - 1) {
                            isStopFrame = 0;
                        }
                    }
                }
                gif.addFrame(canvas, { copy: true, delay: frameTime, })  //canvas生成帧
                if (++i >= frameNum && isStopFrame == 0) {       //已添加所有帧
                    gif.render()
                }
            }
            function breakLinesForCanvas(text, width,ctx) {
                var result = [];
                var breakPoint = 0;
                while ((breakPoint = findBreakPoint(text, width, ctx)) !== -1) {
                    result.unshift(text.substr(0, breakPoint));
                    text = text.substr(breakPoint);
                }
                if (text) {
                    result.unshift(text);
                }
                return result;
            }
            function findBreakPoint(text, width, context) {
                var min = 0;
                var max = text.length - 1;
                
                while (min <= max) {
                    var middle = Math.ceil((min + max) / 2);
                    var middleWidth = context.measureText(text.substr(0, middle)).width;
                    var oneCharWiderThanMiddleWidth = context.measureText(text.substr(0, middle + 1)).width;
                    if (middleWidth <= width && oneCharWiderThanMiddleWidth > width) {
                        return middle;
                    }
                    if (middleWidth < width) {
                        min = middle + 1;
                    } else {
                        max = middle - 1;
                    }
                }
     
                return -1;
            }


            function ani({ ctx, index, len, },mark) {
                // debugger
                let fontSizeTemp = fontSize;
                ctx.font = `${fontSizeTemp}px '${fontFamily}'`;
                // let wText= 300
                // let hText = fontSizeTemp
                let xText = translateStartX + index * (translateEndX - translateStartX) / len
                let yText = translateStartY + index * (translateEndY - translateStartY) / len
                if(mark && translateStartX!=translateMediumX){
                    xText = translateStartX + (translateMediumX - translateStartX)
                }
                if(mark && translateStartY!=translateMediumY){
                    yText = translateMediumY
                }
                ctx.clearRect(0, 0, imgW, imgH)
                ctx.fillStyle = backgroundStyle
                ctx.fillRect(0, 0, imgW, imgH)
                ctx.save()          //状态保存，避免多次操作
                ctx.fillStyle = fontStyle;
                ctx.textAlign = 'center';
                ctx.strokeStyle = '#000';
                result.forEach(function(lineText, i) {
                    ctx.lineWidth = 8;
                    ctx.strokeText(lineText, xText, (yText + (fontSizeTemp * result.length + 40) / 2) - (fontSizeTemp + 20) * i);
                    ctx.fillText(lineText, xText, (yText + (fontSizeTemp * result.length + 40) / 2) - (fontSizeTemp + 20) * i);
                });
                ctx.restore()           //状态恢复
            }
        })
    }
}




export { mkFontgif, mkImgGif, gifToFrames, loadFonts, mkPng,mkFontgif2 }
