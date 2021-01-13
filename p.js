
function fun(a) {
    return Promise.all(a.map((n)=> {
        return new Promise((resolve, reject)=> {
            setTimeout(() => {
                resolve(n);
            }, 2000);
        });
    }))
}
let arr = ['a', 'b', 'c', 'd'];
arr = fun(arr)
.then((result)=> {
    console.log(result);
});