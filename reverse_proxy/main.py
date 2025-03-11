# command to run the server
# python -m uvicorn main:app --reload
# install command
# pip install fastapi uvicorn httpx

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
import uvicorn

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.api_route("/{path:path}", methods=["GET", "POST"])
async def proxy(request: Request, path: str):
    url = f"http://lk.ominds.ru:2000/{path}"  # Replace with the target URL
    method = request.method
    headers = dict(request.headers)
    body = await request.body()

    async with httpx.AsyncClient() as client:
        response = await client.request(method, url, headers=headers, content=body)

    return response.text

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
