// Our bundler automatically creates styling when imported in the main JS file!
import '../styles/style.css'

// We can use node_modules directely in the browser!
import * as d3 from 'd3';
import count from './count.js';

console.log('Hello, world!');


var sqrtScale;

//default zoeken op 2020
let selectedSeason = "2020";

//confirm code - fetch works
fetch("https://www.balldontlie.io/api/v1/season_averages?seasons=2016&player_ids[]=237")
.then(res => res.json())
.then(data => console.log(data));



//fetch met ordening data werkt wel?
// function getData() {
// 	fetch('https://www.balldontlie.io/api/v1/teams')
// 	.then(res => res.json())
// 	.then(data => {
// 		//data.map geen functie -> data.data.map 
// 		const teams = data.data.map(item => {
// 			let newItem = {
// 				name: item["full_name"],
// 				city: item["city"],
// 			}

// 			return newItem
// 		})
// 		console.log(teams);
// 	});
// }

// getData();

//CODE FOR PAGE
//const
const searchBar = document.getElementById("searchBar");
const button = document.getElementById("search_button");

//Menu seizon selecteren om op te zoeken + button txt update na klik
document.querySelectorAll(".dropdwn-ct a").forEach(link => {
	link.addEventListener("click", function(e) {
		e.preventDefault();
		selectedSeason = this.id.replace("season", "")
		console.log("Selected season:", selectedSeason);
		
		//https://www.shecodes.io/athena/6541-what-is-the-difference-between-double-quotes-and-backticks-in-javascript#:~:text=The%20difference%20between%20%22%20(double%20quotes,a%20template%20literal%20in%20JavaScript.
		const seasonButton = document.getElementById("dropbutton");
		seasonButton.textContent = `Seizoen: ${selectedSeason}`;
	});
});

//zoeken op enter https://stackoverflow.com/questions/14542062/eventlistener-enter-key
button.addEventListener('click', searchValue);
document.querySelector("#searchBar").addEventListener("keypress", function (e){
	if (e.key === "Enter"){
		searchValue(e);
	}
});

//speler data opzoeken(dit is wel heuidige data ~ veranderd nie met seizoen select)
function searchValue(e) {
	e.preventDefault();
	const input = document.getElementById("searchBar").value.toLowerCase();
	console.log("Selected season:", selectedSeason, input);
	fetch("https://www.balldontlie.io/api/v1/players?search="+searchBar.value)
	.then(res => res.json())
	.then(data => 
		
	{
		const playa = data.data.map(item => {
			let newItem = {
				name: item["first_name"] + " " + item["last_name"] ,
				ID: item["id"],
				position: item["position"],
				team: item["team"]["full_name"],
			}
			return newItem
		});
		
		
		
		d3.select("#playerInfo h1") 
		  .text(playa[0].name)
		console.log(playa)
		d3.select("#position")
		  .text("Position: "+ playa[0].position)
		d3.select("#team")
		  .text("Team: "+ playa[0].team);
		  
		d3.select("#stats").selectAll("*").remove();
			//gebruik id van speler voor 2de fetch voor stats
			//https://www.balldontlie.io/api/v1/season_averages?seasons[]=2018&seasons[]=2015&player_ids[]=237 goede fetch
		fetch(`https://www.balldontlie.io/api/v1/season_averages?season=${selectedSeason}&player_ids[]=${playa[0].ID}`) //verkeerde fetch gaf altijd s2023
		  .then(res => res.json())
		  .then(data =>
			  { 
				console.log(data);
				const s20Averages = data.data.map(item => ({
					points: item.pts,
					steals: item.stl,
					blocks: item.blk,
					assists: item.ast,
					rebounds: item.reb,
					fga: item.fga,
					fgm: item.fgm,
				}));
				console.log("data", s20Averages);
				
				//aparte array voor de data(nummers) s20Averages geeft een object ~ lukt niet om die werkend te krijgen
				const numericValues = Object.values(s20Averages[0]);
				console.log("numbers", numericValues);
		
				// Grootte circles gebasseerd op numericValues 
				const sqrtScale = d3.scaleSqrt()
					.domain([0, d3.max(numericValues)])
					.range([15, 30]);

				var w = 500;
				var h = 500;
				
				//FORCE 
				const svg = d3.select("#stats")
							.append("svg")
							.attr("width", w)
							.attr("height", h);

                    const simulation = d3.forceSimulation(numericValues.map((d, i) => ({ value: d })))
						.force("charge", d3.forceManyBody().strength(5))
                        .force("collide", d3.forceCollide().radius(d => sqrtScale(d.value) + 2)) //geen overlap
                        .force("center", d3.forceCenter(w / 2, h / 2))
                        //.stop()
						.on("tick", ticked);

					//https://www.d3indepth.com/force-layout/ + https://codepen.io/vijnv/pen/MWXOoVq
					function ticked() {

						const circles = svg.selectAll(".basketballs")
							.data(numericValues.map((d, i) => ({ value: d, x: simulation.nodes()[i].x, y: simulation.nodes()[i].y })))
							//de circles en labels aan elkaar vastbinden
							//array met de nummers > voor elk element uit data (d) op index i in de array wordt een node aangemaakt met de data die ik fetch (d), een x coordinaat in de sim op i en een y coordinaat op i
							.join("circle")
							.attr("class", "basketballs")
							.attr("cx", d => d.x)
							.attr("cy", d => d.y)
							.attr("r", d => sqrtScale(d.value));

						svg.selectAll(".label")
							.data(numericValues.map((d, i) => ({ value: d, x: simulation.nodes()[i].x, y: simulation.nodes()[i].y })))
							.join("text")
							.attr("class", "label")
							.attr("x", d => d.x)
							.attr("y", d => d.y)
							.attr("text-anchor", "middle")
							.attr("dy", ".3em")
							.style("font-size", d => sqrtScale(d.value) / 2)
							.style("fill", "#fff")
							.text(d => d.value);

					}

			})
			.catch(error => console.error("Error fetching data:", error));
			
			


	});

};
