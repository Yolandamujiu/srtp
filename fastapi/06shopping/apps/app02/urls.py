from fastapi import APIRouter
shop =  APIRouter()
@shop.get('/food')
async def shop_food():
    return {"shop":"food"}
@shop.get('/bed')
async def shop_bed():
    return {"shop":"bed"}