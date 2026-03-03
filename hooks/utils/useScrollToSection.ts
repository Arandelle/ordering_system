import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function useScrollToSection(){
    const searchParams = useSearchParams();

    useEffect(() => {
        const target = searchParams.get("section");

        if(!target) return;

        const el = document.getElementById(`${target}-section`);
        el?.scrollIntoView({behavior: "smooth"});
    }, [searchParams])
}