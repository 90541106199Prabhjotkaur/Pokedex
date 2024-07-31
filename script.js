document.addEventListener('DOMContentLoaded', () => {
    const pokemonGallery = document.getElementById('pokemon-gallery');
    const loadMoreButton = document.getElementById('load-more');
    const pokemonDetails = document.getElementById('pokemon-details');
    const caughtPokemon = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
    let offset = 0;
    const limit = 20;

    const fetchPokemon = async (offset, limit) => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
        const data = await response.json();
        return data.results;
    };

    const fetchPokemonDetails = async (url) => {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    };

    const renderPokemon = (pokemon) => {
        const container = document.createElement('div');
        container.classList.add('pokemon-container');
        container.innerHTML = `
            <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
            <p>${pokemon.name}</p>
            <button class="catch-btn">${caughtPokemon.includes(pokemon.name) ? 'Release' : 'Catch'}</button>
        `;
        container.querySelector('.catch-btn').addEventListener('click', (event) => {
            event.stopPropagation();
            toggleCatchPokemon(pokemon.name, container.querySelector('.catch-btn'));
        });
        container.addEventListener('click', async () => {
            const details = await fetchPokemonDetails(pokemon.url);
            showPokemonDetails(details);
        });
        pokemonGallery.appendChild(container);
    };

    const loadPokemon = async () => {
        const pokemonList = await fetchPokemon(offset, limit);
        for (const pokemon of pokemonList) {
            const details = await fetchPokemonDetails(pokemon.url);
            renderPokemon(details);
        }
        offset += limit;
    };

    const showPokemonDetails = (pokemon) => {
        pokemonDetails.innerHTML = `
            <h2>${pokemon.name}</h2>
            <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
            <p>Height: ${pokemon.height / 10} m</p>
            <p>Weight: ${pokemon.weight / 10} kg</p>
            <button id="catch-btn">${caughtPokemon.includes(pokemon.name) ? 'Release' : 'Catch'}</button>
        `;
        pokemonDetails.classList.remove('hidden');
        pokemonDetails.querySelector('#catch-btn').addEventListener('click', () => {
            toggleCatchPokemon(pokemon.name, pokemonDetails.querySelector('#catch-btn'));
        });
    };

    const toggleCatchPokemon = (pokemonName, button) => {
        if (caughtPokemon.includes(pokemonName)) {
            const index = caughtPokemon.indexOf(pokemonName);
            caughtPokemon.splice(index, 1);
            button.textContent = 'Catch';
        } else {
            caughtPokemon.push(pokemonName);
            button.textContent = 'Release';
        }
        localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
        pokemonGallery.innerHTML = '';
        offset = 0;
        loadPokemon();
        if (pokemonDetails.querySelector('h2')?.textContent === pokemonName) {
            showPokemonDetails(pokemonDetails.querySelector('h2')?.textContent);
        }
    };

    loadMoreButton.addEventListener('click', loadPokemon);

    loadPokemon();
});