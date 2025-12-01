from fastapi import FastAPI
import uvicorn  

# 注册shop 和 user 文件
from apps.app01.urls import user
from apps.app02.urls import shop

app = FastAPI() 

# 引用route
app.include_router(shop,prefix="/shop",tags=["购物中心接口"])
app.include_router(user,prefix="/user",tags=["用户中心接口"])

# 根
@app.get('/')
async def main():
    return {"系统":"main"}

if __name__ == "__main__":  uvicorn.run("main:app",port=8081,reload=True) 