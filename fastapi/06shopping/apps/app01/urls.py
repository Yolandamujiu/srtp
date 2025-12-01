from fastapi import APIRouter
user = APIRouter()
@user.get('/login',summary="这是一个登录接口",description="主要用来登录")
async def user_login():
    return {"user":"login"}
@user.get('/reg',summary="这是一个注销接口",description="主要用来注销用户登录")
async def user_reg():
    return {"user":"reg"} 