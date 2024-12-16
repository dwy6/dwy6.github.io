function build_url() {
    // 获取用户输入的 URL 并进行 URL 编码以确保其格式正确
    var url = encodeURI(decodeURI(document.querySelector('#url').value));

    // 检查输入的 URL 是否为空或是否包含 "http"（用以判断其是否为有效链接）
    if (url === "" || url.indexOf("http") === -1) {
        // 如果输入无效，显示错误提示信息
        document.getElementById("b_url").innerHTML = `输入的不是链接或者未加 http 请求头！`;
    } else {
        // 构造目标 URL，附加到指定的基础路径
        url = "https://qiantigers.github.io/qq_fanghong/" + "api/?url=" + url;

        // 显示生成的 URL 并创建一个可以点击的超链接
        document.getElementById("b_url").innerHTML = `<a href=${url} target='_blank'>${url}</a>`;
    }
}
