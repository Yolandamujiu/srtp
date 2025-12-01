from fastapi import FastAPI # FastAPI 是一个为你的 API 提供了所有功能的 Python 类。
import uvicorn

app = FastAPI() # 这个实例将是创建你所有 API 的主要交互对象。这个 app 同样在如下命令中被 uvicorn 所引用

@app.get("/")#路径操作装饰器
async def home():#路径操作函数
    return {"user_id": 1001}

@app.get("/shop",tags=["这是一个items测试接口"],
           summary="this is items测试 summary",
           description="this is items测试 description")
async def shop():
    return {"shop": "商品信息"}

if __name__ == "__main__":
    uvicorn.run("fastapi_quickstart:app", host="127.0.0.1", port=8080, reload=True)
