
export function makeRequest(options) {
    return new Promise((resolve, reject)=> {
        let xhr = new XMLHttpRequest();
        xhr.open(options.method, options.url, true);
        xhr.onreadystatechange = ()=> {
            if(xhr.readyState === XMLHttpRequest.DONE) {
                var status = xhr.status;
                if (status === 0 || (status >= 200 && status < 400)) {
                  // The request has been completed successfully
                  resolve({
                        status: xhr.status,
                        statusText: xhr.statusText,
                        response: JSON.parse(xhr.responseText)
                      });
                } else {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText,
                        response: JSON.parse(xhr.responseText)
                    });
                }
            }
        };
        xhr.onerror=()=>{
            reject({
                status: xhr.status,
                statusText: xhr.statusText,
                response: JSON.parse(xhr.responseText)
            });
        };
        //setting header...
        let headers = options.headers, params = options.params, data;
        if (headers && typeof headers == 'object') {
            for (const [key, value] of Object.entries(headers)) {
                xhr.setRequestHeader(key, value);
            }
        }
        //setting params...
        if (params && typeof params == 'object') {
            params = Object.keys(params).map(function (key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
            }).join('&');
        }

        // setting data in JSON form
        data = JSON.stringify(options.data);
        xhr.send(data);
    }); 
}