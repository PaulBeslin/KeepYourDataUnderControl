class QrCode {

    constructor(link, qrCodeLink) {
        this.image = null;
        this.link = link;
        this.qrCodeLink = qrCodeLink;
    }
    
    static b64toBlob(b64Data, contentType='', sliceSize=512){
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
      
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
      
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
      
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
      
        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }


    convertDataURIToBinary(dataURI) {
            var BASE64_MARKER = ';base64,';
            var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
            var base64 = dataURI.substring(base64Index);
            var raw = window.atob(base64);
            var rawLength = raw.length;
            var array = new Uint8Array(new ArrayBuffer(rawLength));

            for(let i = 0; i < rawLength; i++) {
                array[i] = raw.charCodeAt(i);
            }
            return array;
    }

    encode(){
        //TODO replace the following encoding algorithm by using a js library
        if (this.link !== undefined) {
            console.log("YOUR ENCODING DATA ",this.link);
            let qr = QRCode.generatePNG(this.link, {
                ecclevel: "M",
                format: "html",
                fillcolor: "#CCCCCC",
                textcolor: "#006F94",
                margin: 4,
                modulesize: 8
            });

            let base64Data = qr.split(",")[1];
            this.image = QrCode.b64toBlob(base64Data, 'image/png');
            return qr;

            /*
            let blobQr1 = new QRCode("qrCode", {
                text:this.link,
                width: 128,
                height: 128,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });

            console.log("MY BLOB QR",document.querySelector("#qrCode img"));
            let self = this;
            setTimeout(() => {
                let base64Data = document.querySelector("#qrCode img").getAttribute("src").split(",")[1];
                this.image = self.b64toBlob(base64Data,'image/png');
            }, 100); */        
        }
    }


    getImage() {
        if (this.image !== undefined) {
            return this.image;
        }
        else {throw new Error("Image not defined")}
    }

    decodeQrCode(dataUri, cb) {
        qrcode.callback = cb;
        qrcode.decode(dataUri);
    }

    decode() {
        //TODO replace the following decoding algorithm by using a js library
        
        toDataURL(this.qrCodeLink,(item)=>{
            //console.log("Here is your item",item);
            this.decodeQrCode(item, (imageLink) => {
                this.link = imageLink;
              });
        })
    }
    
    getLink() {
        return this.link;
    }


}

async function toDataURL(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.onload = async function () {
        let reader = new FileReader();
        reader.onloadend = await function () {
            callback(reader.result);
        }
        await reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    await xhr.send();
}