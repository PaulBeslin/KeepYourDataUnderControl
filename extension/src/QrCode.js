import { Encoder, Decoder, ErrorCorrectionLevel} from '@nuintun/qrcode';
var b64toBlob = require('b64-to-blob');

export default class Qrcode {
    

    constructor(link, qrCodeLink) {
        this.image = null;
        this.link = link;
        this.qrCodeLink = qrCodeLink;
    }

    encode(){
        //TODO replace the following encoding algorithm by using a js library
        if (this.link !== undefined) {

            const qrcode = new Encoder();
 
            //qrcode.write(this.link)
            qrcode.write(this.link);
            console.log("DECODE LINK",this.link)
            qrcode.setErrorCorrectionLevel(ErrorCorrectionLevel.H);
            
            qrcode.make();
            
            const base64Data = qrcode.toDataURL(15,12);
            this.image = b64toBlob(base64Data.split(",")[1],'image/png');
        }
    }


    getImage() {
        if (this.image !== undefined) {
            return this.image;
        }else {
            throw new Error("Image not defined");
        }
    }


    async decode() {
        //TODO replace the following decoding algorithm by using a js library
        if(this.qrCodeLink){
            const qrcode = new Decoder();
            await qrcode
            .scan(this.qrCodeLink)
            .then(result => {
                this.link = result.data;
            })
            .catch(error => {
                console.log(error);
            });
        }
    }
    

    getLink() {
        return this.link;
    }


}