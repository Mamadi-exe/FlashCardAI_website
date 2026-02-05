import NavBar from '../../Components/NavBar/NavBar';
import BannerCo from '../../Components/Banner/BannerCo';
import InfoGrid from '../../Components/LearnMore/InfoGrid';
import HowWorks from '../../Components/Explanation/HowWorks';
import Footer from '../../Components/Footer/Footer';

export default function Home(){
    return(
        <div>
            <NavBar />
            <BannerCo />
            <InfoGrid />
            <HowWorks />
            <Footer />
        </div>
    )
}