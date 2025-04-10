import { Avatar, Button, Image } from "@mantine/core";
import { AuthContext, pb } from "../lib/pb";
import { use, useEffect, useState } from "react";
import { AuthRecord } from "pocketbase";
import { LoginPage } from "./Login.page";
import { ProfilePage } from "./Profile.page";
import { useNavigate, useNavigation } from "react-router-dom";

export function HomePage() {
    const user = use(AuthContext)
    const navigate = useNavigate()

    if (!user) {
        return <>
            <a href="/login">{"> Login"}</a>
            <div className='text-xl font-bold mb-6'>Welcome to Artcon</div>
            <Button onClick={() => navigate("/login")}>Login</Button>
        </>
    }
    return (
        <>
            <ProfilePage />
        </>
    );
}