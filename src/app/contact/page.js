import Button from '@/components/ui/Button';

export default function ContactPage() {
    return (
        <div className="pt-[140px] pb-24 px-4 min-h-screen max-w-[1400px] mx-auto">
            <h1 className="font-outfit text-5xl md:text-7xl font-bold uppercase text-white mb-16 tracking-wider">Contact</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32">
                {/* Info */}
                <div>
                    <div className="mb-12">
                        <h3 className="text-grey-500 uppercase tracking-widest text-sm mb-4">Studio</h3>
                        <p className="text-white text-xl leading-relaxed">
                            SAI KIRAN<br />
                            +917720820577
                        </p>
                    </div>

                    <div className="mb-12">
                        <h3 className="text-grey-500 uppercase tracking-widest text-sm mb-4">Email</h3>
                        <a href="mailto:hello@kshra.store" className="text-white text-xl hover:text-grey-400 transition-colors">
                            hello@kshra.store
                        </a>
                    </div>

                    <div className="mb-12">
                        <h3 className="text-grey-500 uppercase tracking-widest text-sm mb-4">Social</h3>
                        <div className="flex flex-col gap-2">
                            {['Instagram', 'Twitter', 'Pinterest'].map(social => (
                                <a key={social} href="#" className="text-white text-lg hover:text-grey-400 transition-colors">
                                    {social}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-grey-500 uppercase tracking-widest text-xs">Name</label>
                        <input
                            type="text"
                            className="w-full bg-transparent border-b border-grey-800 text-white pb-3 focus:border-white focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-grey-500 uppercase tracking-widest text-xs">Email</label>
                        <input
                            type="email"
                            className="w-full bg-transparent border-b border-grey-800 text-white pb-3 focus:border-white focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-grey-500 uppercase tracking-widest text-xs">Message</label>
                        <textarea
                            rows="4"
                            className="w-full bg-transparent border-b border-grey-800 text-white pb-3 focus:border-white focus:outline-none transition-colors resize-none"
                        ></textarea>
                    </div>

                    <Button variant="solid" size="lg" className="w-full">
                        Send Message
                    </Button>
                </form>
            </div>
        </div>
    );
}
