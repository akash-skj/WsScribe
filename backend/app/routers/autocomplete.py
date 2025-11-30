from fastapi import APIRouter, Depends, HTTPException
from app import schemas

router = APIRouter(
    prefix="/autocomplete"
)

@router.post("/", response_model=schemas.AutocompleteResponse)
async def autocomplete(request: schemas.AutocompleteRequest):
    suggestion_text = "print('Hello World')"
    return schemas.AutocompleteResponse(suggestion=suggestion_text)