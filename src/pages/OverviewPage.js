import TitledBox from "../elements/boxes/TitledBox";
import BulletLi from "../elements/lists/BulletLi";
import {Link} from "react-router-dom";

const OverviewPage = () => {
    return (
        <div>
            <TitledBox title="Welcome to the RevoGains app">
                <p>
                    The RevoGains app is built to calculate your capital gains (or losses) on crypto currency trades
                    made inside the Revolut app. And provide the corresponding Form 849 tax forms for filing the us taxes.
                </p>
                <p className='font-bold'>
                    This app is provided without guaranties, you are still responsible to for your own tax returns
                    and the app does not file the taxes for you.
                </p>
                <p className='font-bold'>
                    The app assumes that you bought and sold all your crypto currencies using the same fiat currency.
                </p>
            </TitledBox>
            <TitledBox title="How it works">
                <p>Before you can use this app, you must download your revolut statements form you revolut account.</p>
                <div>
                    To do so, you must:
                    <ul>
                        <BulletLi>
                            Go to <a href="https://www.revolut.com/" target='_blank' className="text-blue-800" rel="noreferrer" >
                                https://www.revolut.com/
                            </a>
                        </BulletLi>
                        <BulletLi> Log in</BulletLi>
                        <BulletLi> Go on the account you used to buy and sell your crypto assets (eg EUR, USD, GBP...)</BulletLi>
                        <BulletLi>
                            Generate a statement on that account using the "Excel" (actually csv) format and make sure
                            the date range selected includes the entire period since your first purchase of crypto assets
                            (that will probably include severa years)
                        </BulletLi>
                        <BulletLi>
                            Go on each crypto account you have and generate a "Excel" (actually csv) statement
                            using a date range that includes all the transactions you have ever had on that account
                        </BulletLi>
                        <BulletLi>
                            On the RevoGains app, go to the <Link to='/settings' className='text-blue-800'>"Settings" page </Link>
                            to set your "local" fiat currency (the currency you used to buy/sell the crypto assets)
                        </BulletLi>
                        <BulletLi>
                            On the RevoGains app, go to the <Link to='/files' className='text-blue-800'>"Files" page </Link>
                            and there upload all your statements from the revolut app
                        </BulletLi>
                        <BulletLi>
                            If all went well, you can go to the <Link to='/form-8949' className='text-blue-800'>"Form 8949" page </Link>
                            and download your tax forms</BulletLi>
                    </ul>
                </div>

            </TitledBox>
        </div>
    );
}

export default OverviewPage;
