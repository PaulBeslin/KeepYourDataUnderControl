Element.prototype._addEventListener = Element.prototype.addEventListener;
Element.prototype.addEventListener = function (a, b, c) {
    if (c == undefined) c = false;

    if (!this.eventListenerList) this.eventListenerList = {};
    if (!this.eventListenerList[a]) this.eventListenerList[a] = [];

    if (a == "change") {

        let eventListener = e => {
            if ((this.nodeName.toLowerCase() == 'input' && this.type.toLowerCase() == "file") || (this.querySelector('input[type=file]'))) {
                window.postMessage({
                    type: "Encode_Image",
                    file: e.target.files[0]
                }, "*");
                setTimeout(() => {
                    this.eventListenerList.change[1].listener(e);
                }, 1000);

            } else {
                this.eventListenerList.change[1].listener(e);
            }
        }

        this.eventListenerList[a].push({
            listener: eventListener,
            options: c
        });

        this.eventListenerList[a].push({
            listener: b,
            options: c
        });

    } else {
        this._addEventListener(a, b, c);
        this.eventListenerList[a].push({
            listener: b,
            options: c
        });
    }
};