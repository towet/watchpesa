import logo from '@/assets/pesalogo.png';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-fade-out">
      <img 
        src={logo}
        alt="WatchPesa Logo"
        className="w-48 h-auto animate-pulse-slow"
      />
    </div>
  );
};

export default SplashScreen;
