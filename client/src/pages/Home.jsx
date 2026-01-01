const Home = () => {
    return (
        <div className="p-8 h-full flex flex-col">
            
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Home</h1>
        
        <div class=" h-full grid grid-cols-3 grid-rows-2 gap-1 p-1">
        <div class="bg-[#E5E5E5] rounded-lg m-1 col-span-2 row-span-1">
            <h1 class="text-2xl m-2 font-['Inria_Sans'] font-light">Notice</h1>
            <div class="w-full border-t-2 border-black"></div>
        </div>
        
        <div class="bg-[#E5E5E5] rounded-lg m-1 col-span-2 row-start-2">
            <h1 class="text-2xl m-2 font-['Inria_Sans'] font-light">Assigned-Issues</h1>
            <div class="w-full border-t-2 border-black"></div>
        </div>
        
        <div class="bg-[#E5E5E5] rounded-lg m-1 row-span-2 col-start-3">
            <h1 class="text-2xl m-2 font-['Inria_Sans'] font-light">Recent-Works</h1>
            <div class="w-full border-t-2 border-black"></div>
        </div>
    </div>
        </div>
    );
};

export default Home;
