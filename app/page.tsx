import EventCard from "./components/eventCard"
import ExploreBtn from "./components/exploreBtn"
const events = [
  { image: '/images/event1.png', title:'Event 1', slug:'Event 1', location:'event 1', date:'event 1', time:'event 1'},
  { image: '/images/event2.png', title:'Event 2', slug:'Event 2', location:'event 2', date:'event 2', time:'event 2'},
  { image: '/images/event3.png', title:'Event 3', slug:'Event 3', location:'event 3', date:'event 3', time:'event 3'},
  { image: '/images/event4.png', title:'Event 4', slug:'Event 4', location:'event 4', date:'event 4', time:'event 4'},
  { image: '/images/event5.png', title:'Event 5', slug:'Event 5', location:'event 5', date:'event 5', time:'event 5'},
  { image: '/images/event6.png', title:'Event 6', slug:'Event 6', location:'event 6', date:'event 6', time:'event 6'}
]

const Home = () => {
  return(
    <section>
      <h1 className="text-center">The Hub for Every Dev <br />Event You Can't Miss </h1>
      <p className="text-center mt-5">Hackathons, Meetups, and Conferances, All in One Place</p>
      
      <ExploreBtn />

      <div className="mt-50 space-y-7">
        <h3>Featured Events</h3>

        <ul className="events">
          {events.map((event) => (
            <li key={event.title}>
              <EventCard { ...event }/>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Home