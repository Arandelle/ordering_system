import React from 'react'
import Header from './components/Header'
import HeroBanner from './components/HeroBanner'
import TheOpportunity from './components/TheOpportunity'
import OurAdvantage from './components/OurAdvantage'
import ScalableInvestmentTiers from './components/Investment'
import WeBuildSuccessTogether from './components/WeBuildSuccess'
import WhoWeAre from './components/WhoWeAre'

const Clientpage = () => {
  return (
    <div>
      <Header />
      <HeroBanner />
      <TheOpportunity />
      <WhoWeAre />
      <OurAdvantage />
      <ScalableInvestmentTiers />
      <WeBuildSuccessTogether />
    </div>
  )
}

export default Clientpage
