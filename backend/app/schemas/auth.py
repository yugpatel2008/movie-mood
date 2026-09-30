from pydantic import BaseModel, EmailStr, field_validator

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    confirm_password: str

    @field_validator('username')
    @classmethod
    def username_min_length(cls, v):
        if len(v.strip()) < 3:
            raise ValueError('Username must be at least 3 characters')
        return v.strip()

    @field_validator('password')
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v, info):
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('Passwords do not match')
        return v

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True
