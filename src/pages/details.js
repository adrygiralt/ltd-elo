import Link from 'next/link'

export default function Details({ownersList}) {
    console.log(ownersList)
    return <div>
        {ownersList.map( (e, index) => (
        <div key={index}>        
        <Link href={`/${e.object}/${e.person}`}>
        <a>{e.person}'s {e.object}</a>
        </Link>
        </div>
        ))}
    </div>
}

Details.getInitialProps = async () => {
    const response = await fetch('http://localhost:3000/api/people')
    const ownersList = await response.json()
    return {
        ownersList : ownersList
    }
}