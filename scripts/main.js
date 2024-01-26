// Our bundler automatically creates styling when imported in the main JS file!
import '../styles/style.css'

// We can use node_modules directely in the browser!
import * as d3 from 'd3';
//import count from './count.js';

console.log('Hello, world!');


var sqrtScale;

const neon = document.getElementById("neon");
neon.addEventListener("click", function(){
	location.reload(true);
});
neon.style.cursor= "pointer";

//default zoeken op 2020
let selectedSeason = "2020";

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
		searchValue(e);
		
		//https://www.shecodes.io/athena/6541-what-is-the-difference-between-double-quotes-and-backticks-in-javascript#:~:text=The%20difference%20between%20%22%20(double%20quotes,a%20template%20literal%20in%20JavaScript.
		const seasonButton = document.getElementById("dropbutton");
		seasonButton.textContent = `Seizoen: ${selectedSeason}`;
	});
});

const seasonButton = document.getElementById("dropbutton");
seasonButton.style.display = "none";

//zoeken op enter https://stackoverflow.com/questions/14542062/eventlistener-enter-key
button.addEventListener('click', searchValue);
document.querySelector("#searchBar").addEventListener("keypress", function (e){
	if (e.key === "Enter"){
		searchValue(e);
	}
});

function showSeasonButton(){
	seasonButton.style.display = "inline-block";
}


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
				position: item["position"] || "N/A",
				team: item["team"] ? item["team"]["full_name"] : "N/A",
				weight: item["weight_pounds"] !==null ? item["weight_pounds"] : "N/A",
			}
			return newItem
		});
		
		
		
		d3.select("#playerInfo h1") 
		  .text(playa[0].name)
		console.log(playa)
		d3.select("#seizoen")
		  .text("Seizoen: "+ selectedSeason)
		d3.select("#team")
		  .text("Huidig team: "+ (playa[0].team === "N/A" ? "N/A" : playa[0].team)),
		d3.select("#position")
		  .text("Positie: "+ playa[0].position)
		d3.select("#weight")
		  .text("Gewicht: "+ (playa[0].weight === "N/A" ? "N/A" : playa[0].weight +" lb"));
		
		showSeasonButton();


		d3.select("#stats").selectAll("*").remove();
			//gebruik id van speler voor 2de fetch voor stats
			//https://www.balldontlie.io/api/v1/season_averages?seasons[]=2018&seasons[]=2015&player_ids[]=237 goede fetch
		fetch(`https://www.balldontlie.io/api/v1/season_averages?season=${selectedSeason}&player_ids[]=${playa[0].ID}`) //verkeerde fetch gaf altijd s2023
		  .then(res => res.json())
		  .then(data => {
			if (data.data && data.data.length > 0) {
				 
					console.log(data);
					const s20Averages = [
						{ stat: "points", value: data.data[0].pts },
						{ stat: "steals", value: data.data[0].stl },
						{ stat: "blocks", value: data.data[0].blk },
						{ stat: "assists", value: data.data[0].ast },
						{ stat: "rebounds", value: data.data[0].reb },
						{ stat: "fga", value: data.data[0].fga },
						{ stat: "fgm", value: data.data[0].fgm },
					];
					
					console.log("data", s20Averages);	

				// Grootte circles gebasseerd op numericValues 
				const sqrtScale = d3.scaleSqrt()
					.domain([0, d3.max(s20Averages, d => d.value)])
					.range([15, 50]);

				var w = 350;
				var h = 300;
				
				//FORCE 
				const svg = d3.select("#stats")
							.append("svg")//IEDERE KEER DAT IK DATA FETCH MAAK IK SVG AAN - HOEFT MAAR 1 KEER IPC
							.attr("width", w)
							.attr("height", h);

                    const simulation = d3.forceSimulation(s20Averages.map((d, i) => ({ value: d.value })))
						.force("charge", d3.forceManyBody().strength(5))
                        .force("collide", d3.forceCollide().radius(d => sqrtScale(d.value) + 2)) //geen overlap
                        .force("center", d3.forceCenter(w / 2, h / 2))
                        .on("tick", ticked);

					//https://www.d3indepth.com/force-layout/ + https://codepen.io/vijnv/pen/MWXOoVq
					function ticked() {

						const circles = svg.selectAll(".basketballs")
							.data(s20Averages.map((d, i) => ({ value: d.value, stat: d.stat, x: simulation.nodes()[i].x, y: simulation.nodes()[i].y })))
							//de circles en labels aan elkaar vastbinden
							//array met de nummers > voor elk element uit data (d) op index i in de array wordt een node aangemaakt met de data die ik fetch (d), een x coordinaat in de sim op i en een y coordinaat op i
							.join("circle")//.BASKETBALLS ALS DE CIRKELS ER AL ZIJN KAN D3 ZE HERGEBRUIKEN
							.attr("class", "basketballs")
							.attr("cx", d => d.x)
							.attr("cy", d => d.y)
							.attr("r", d => sqrtScale(d.value))
							//muisie popup
							.on("mouseover touchstart", handleMouseOver)
        					.on("mousemove", handleMouseMove)
        					.on("mouseout", handleMouseOut);

						svg.selectAll(".label")
							.data(s20Averages.map((d, i) => ({ value: d.value, stat: d.stat, x: simulation.nodes()[i].x, y: simulation.nodes()[i].y })))
							.join("text")
							.attr("class", "label")
							.attr("x", d => d.x)
							.attr("y", d => d.y)
							.attr("text-anchor", "middle")
							.attr("dy", ".3em")
							.style("font-size", d => sqrtScale(d.value) / 2) 
							.style("fill", "#fff")
							.text(d => d.value)
							//muisie popup
							.on("mouseover touchstart", handleMouseOver)
        					.on("mousemove", handleMouseMove)
        					.on("mouseout", handleMouseOut);

						function handleMouseOver(e, d) {
							d3.select(".tooltip")
								.transition()
								.duration(175)
								.style("opacity", 1)
								.text(`${d.stat}: ${d.value}`);
						}

						function handleMouseMove(e) {
							d3.select(".tooltip")
								.style("left", e.pageX + 15 + "px")
								.style("top", e.pageY + 15 + "px");
						}

						function handleMouseOut() {
							d3.select(".tooltip").style("opacity", 0);
						}

												

					}


			} else {
				d3.select("#stats")
				  .append("div")
				  .attr("class","error")
				  .append("div")
				  .attr("class", "error_message")
				  .text(`${playa[0].name} heeft geen data beschikbaar :(`);
			}
	})
		.catch(error => 
			{
				console.error("Error fetching data:", error);
			});

})};
