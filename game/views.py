from django.http import HttpResponse


def index(request):
    line1 =  '<h1 style = "text-align: center">十二猫舍的狂欢</h1>'
    line4 = '<a href = "/play/">进入</a>'
    line2 = '<img src = "https://img-blog.csdnimg.cn/247d1203224f46bda51a376267b65987.png" width = 1600>'
    line3 = '<hr>'
    return HttpResponse(line1 + line4 + line3 + line2)#返回字符串

def play(request):
    line1 = '<h1 style = "text-align:center">游戏界面</h1>'
    line3 = '<a href = "/">返回主页面</a>'
    line2 = '<img src = "https://img-blog.csdnimg.cn/4e88078e285647b58b53ae3e0e5a3aba.png" width = 1600>'
    return HttpResponse(line1 + line3 + line2)
