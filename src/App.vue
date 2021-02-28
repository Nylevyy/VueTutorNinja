<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <div class="w-full my-4"></div>
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700">Тикер</label>
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="tickerInputValue"
                @keydown.enter="addTicker"
                @input="clearError"
                @change="clearError"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
              />
              <div
                v-if="getMatchingTags().length"
                class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
              >
                <span
                  v-for="tag in getMatchingTags()"
                  :key="tag"
                  @click="handleTagClick(tag)"
                  class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
                >
                  {{ tag }}
                </span>
              </div>
              <div v-if="tickerInputError" class="text-sm text-red-600">{{ tickerInputError }}</div>
            </div>
          </div>
        </div>
        <button
          @click="addTicker"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Добавить
        </button>
      </section>
      <hr class="w-full border-t border-gray-600 my-4" />
      <div class="flex items-center">
        <button
          :disabled="page === 1"
          @click="prevPage"
          class="w-24 my-4 justify-center mx-2 inline-flex items-center py-2 px-4 border border-transparent disabled:opacity-50 shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Назад
        </button>
        <button
          :disabled="page === pagesLimit"
          @click="nextPage"
          class="w-24 justify-center my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent disabled:opacity-50 shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Вперед
        </button>
        <span class="ml-12 text-gray-900 text-lg">Страница: {{ page }}</span>
      </div>
      <hr class="w-full border-t border-gray-600 my-4" />
      <div class="flex items-center">
        <span class="mr-8 text-gray-900">
          Фильтр:
        </span>
        <input
          v-model="filterValue"
          type="text"
          class="block pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
        />
      </div>
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in filterList()"
            :key="t.name"
            @click="setActiveTicker(t)"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">{{ t.name }} - USD</dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ t.value }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="removeTicker(t.name)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <section v-if="activeTicker" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ activeTicker.name }} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div
            v-for="(val, idx) in updateGraph()"
            :style="{ height: `${val}%` }"
            :key="idx"
            class="bg-purple-800 border w-10"
          ></div>
        </div>
        <button @click="activeTicker = null" type="button" class="absolute top-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background:new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<script>
import Api from './plugins/api';

export default {
  name: 'App',

  data() {
    return {
      tickerInputValue: '',
      tickerInputError: null,
      tickers: [],
      activeTicker: null,
      graph: [],
      availableTickersList: [],
      page: 1,
      filterValue: '',
    };
  },

  created() {
    const { page, filter } = Object.fromEntries(new URL(window.location).searchParams.entries());

    if (page) {
      this.page = page;
    }

    if (filter) {
      this.filterValue = filter;
    }

    Api.get({
      url: 'https://min-api.cryptocompare.com/data/all/coinlist?summary=true',
    })
      .then(({ Data }) => (this.availableTickersList = Object.keys(Data).map(key => Data[key])))
      .catch(console.log);

    const tickersList = localStorage.getItem('cryptonomicon-list');
    if (tickersList) {
      const encodedList = JSON.parse(tickersList);
      if (encodedList && encodedList.length) {
        this.tickers = encodedList;

        encodedList.forEach(({ name }) => {
          this.fetchData(name);
        });
      }
    }
  },

  watch: {
    // tickerInputValue: {
    //   handler() {
    //     console.log('wtchr');
    //     this.tickerInputError = null;
    //   },
    // },
    filterValue() {
      this.page = 1;

      window.history.pushState(
        null,
        document.title,
        `
      ${window.location.pathname}?filter=${this.filterValue}&page=${this.page}`,
      );
    },

    page() {
      window.history.pushState(
        null,
        document.title,
        `
      ${window.location.pathname}?filter=${this.filterValue}&page=${this.page}`,
      );
    },
  },

  computed: {
    pagesLimit() {
      return Math.max(1, Math.ceil(this.tickers.length / 6));
    },
  },

  methods: {
    nextPage() {
      if (this.page === this.pagesLimit) return;
      this.page++;
    },

    prevPage() {
      if (this.page === 1) return;
      this.page--;
    },

    filterList() {
      const start = 6 * (this.page - 1);
      const end = 6 * this.page;

      return this.tickers
        .filter(({ name }) => {
          return name.match(this.filterValue.toUpperCase());
        })
        .slice(start, end);
    },

    clearError() {
      this.tickerInputError = null;
    },

    validateValue() {
      const valueName = this.tickerInputValue.toUpperCase();

      if (!valueName) {
        this.tickerInputError = 'Введите название тикера';
        return null;
      }

      const hasSame = this.tickers.some(({ name }) => name === valueName);

      const foundValue = this.availableTickersList.find(
        ({ Symbol: symbolName, FullName }) =>
          symbolName.toUpperCase() === valueName || FullName.toUpperCase() === valueName,
      );

      if (hasSame) {
        this.tickerInputError = 'Такой тикер уже есть';
        return null;
      }

      if (!foundValue) {
        this.tickerInputError = 'Такого тикера нет';
        return null;
      }

      return foundValue.Symbol;
    },

    fetchData(tickerName) {
      setTimeout(() => {
        const tickerFromArray = this.tickers.find(({ name }) => name === tickerName);

        if (!tickerFromArray) return;
        Api.get({
          url: `https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD&api_key=42b0663186988e084e85c51390423c69b58d7d953e7139a9cf12b461706d43c9`,
        })
          .then(({ USD }) => {
            tickerFromArray.value = USD > 1 ? USD.toFixed(3) : USD.toPrecision(3);

            if (this.activeTicker?.name === tickerName) {
              this.graph.push(USD);
            }
          })
          .catch(() => {
            this.removeTicker(tickerName);
            return;
          });

        setTimeout(() => this.fetchData(tickerName), 5000);
      }, 5000);
    },

    addTicker() {
      const valueName = this.validateValue();

      if (!valueName) {
        return;
      }

      const currentTicker = {
        name: valueName,
        value: '-',
      };

      this.fetchData(valueName);

      this.tickers.push(currentTicker);
      this.tickerInputValue = '';
      this.filterValue = '';

      localStorage.setItem('cryptonomicon-list', JSON.stringify(this.tickers));
    },

    removeTicker(nameToRemove) {
      this.tickers = this.tickers.filter(({ name }) => name !== nameToRemove);
      localStorage.setItem('cryptonomicon-list', JSON.stringify(this.tickers));
    },

    setActiveTicker(ticker) {
      if (this.activeTicker !== ticker) {
        this.graph = [];
        this.activeTicker = ticker;
      }
    },

    handleTagClick(tag) {
      this.tickerInputValue = tag;
      const newTag = this.validateValue();

      if (!newTag) {
        this.tickerInputError = 'Такой тикер уже есть';

        return;
      }

      this.addTicker(newTag);
      this.tickerInputValue = '';
    },

    updateGraph() {
      const minHeight = Math.min(...this.graph);
      const maxHeight = Math.max(...this.graph);
      return this.graph.map(price => 5 + ((price - minHeight) * 95) / (maxHeight - minHeight));
    },

    getMatchingTags() {
      const input = this.tickerInputValue.toLowerCase();

      if (!input) {
        return [];
      }

      return this.availableTickersList
        .filter(
          ({ Symbol: symbolName, FullName }) =>
            symbolName.toLowerCase().match(input) || FullName.toLowerCase().match(input),
        )
        .map(({ Symbol: symbolName }) => symbolName)
        .slice(0, 4);
    },
  },
};
</script>
