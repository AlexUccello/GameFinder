async function cerca(){
 var input = document.getElementById("searchInput").value;
 if(input){
    var response = await fetch("https://www.cheapshark.com/api/1.0/games?title=" + input);

    const data = await response.json();

    html = "";
    data.forEach(game => {
        html += "<div class='game'>";
        html += "<img src=" + game.thumb + ">";
        html += "<h3>" + game.external + "</h3>";
        html += "<p>Prezzo: " + game.cheapest + "</p>";
        html += "<a href='https://www.cheapshark.com/redirect?dealID=" + game.dealID + "'>Vai al sito</a>";
        html += "</div>";
    });

    document.getElementById("results").innerHTML += html;

 }else{
    return "";
 }
}