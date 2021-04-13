
const CompressImg = {
  compress(files) { // 数组批量压缩图片 ,传入file对象数组，传出压缩后file对象数组，小于50k跳过
    const that = this
    const promiseArr = []
    for (let i = 0; i<files.length; i++) {
      let file = files[i]
      promiseArr.push(new Promise((resolve, reject) => {
        if (file.size < 50*1024) { // 小于50kb不压缩
          resolve(file);
          return;
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const tCanvas = document.createElement("canvas");
        const tctx = tCanvas.getContext("2d");
        const fr = new FileReader();
        fr.onload = function () {
          var img = new Image();
          img.src = this.result; // 未压缩前的base64
          img.onload = function() {
            var initSize = img.src.length; // 未压缩前的base64长度
            var width = img.width;
            var height = img.height;
            //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
            var ratio;
            if ((ratio = width * height / 4000000) > 1) {
              ratio = Math.sqrt(ratio);
              width /= ratio; // 等比缩放
              height /= ratio; // 等比缩放
            } else {
              ratio = 1;
            }
            canvas.width = width;
            canvas.height = height;
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            //如果图片像素大于100万则使用瓦片绘制
            var count;
            if ((count = width * height / 1000000) > 1) {
              count = ~~(Math.sqrt(count) + 1);
              var nw = ~~(width / count);
              var nh = ~~(height / count);
              tCanvas.width = nw;
              tCanvas.height = nh;
              for (var i = 0; i < count; i++) {
                for (var j = 0; j < count; j++) {
                  tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
                  ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
                }
              }
            } else {
              ctx.drawImage(img, 0, 0, width, height);
            }
            //进行最小压缩
            var newBase64 = canvas.toDataURL('image/jpeg', 0.1);
            console.log(`压缩前：${initSize}，压缩后：${newBase64.length}`);
            const compressFile = that.base64URLtoFile(newBase64, file.name || 'image')
            resolve(compressFile);
          }
        };
        fr.readAsDataURL(file);
      }))
    }
    return Promise.all(promiseArr)
  },
  // base64转File
  base64URLtoFile: function(dataurl, filename) { 
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  },
  install(Vue, options={}){
    Vue.prototype.$compressImg = compress;
  }
}


export default CompressImg;