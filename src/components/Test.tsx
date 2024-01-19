import { component$, useSignal, useTask$ } from "@builder.io/qwik";

if(import.meta.env.SSR) {
    console.log("----- has SSR defined");
}

export default component$(() => {
    const count = useSignal(0);

    useTask$(({ track}) => {
        track(()=>count.value);
        
        // #v-ifdef SSR
        console.log("---------- on server")
        // #v-else
        console.log("----------- on client")
        // #v-endif
    })

    
    return (
        <div onClick$={() => count.value++ }>Test Component(click me)</div>
    )
});
