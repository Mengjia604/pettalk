const { PET_BREED_GROUPS } = require('../../utils/petBreeds')

function categoryNames() {
  return PET_BREED_GROUPS.map((group) => group.name)
}

function listByCategory(category) {
  const group = PET_BREED_GROUPS.find((item) => item.name === category)
  if (!group) {
    return []
  }
  return group.breeds.map((name) => ({ name, category: '' }))
}

function searchBreeds(keyword) {
  const value = keyword.trim().toLowerCase()
  const result = []
  PET_BREED_GROUPS.forEach((group) => {
    group.breeds.forEach((name) => {
      if (
        name.toLowerCase().indexOf(value) !== -1 ||
        group.name.toLowerCase().indexOf(value) !== -1
      ) {
        result.push({ name, category: group.name })
      }
    })
  })
  return result
}

function findCategory(breed) {
  if (!breed) {
    return ''
  }
  const group = PET_BREED_GROUPS.find((item) => item.breeds.indexOf(breed) !== -1)
  return group ? group.name : ''
}

Page({
  data: {
    categories: categoryNames(),
    activeCategory: PET_BREED_GROUPS[0].name,
    currentBreed: '',
    keyword: '',
    searching: false,
    list: [],
    scrollIntoView: ''
  },

  onLoad(options) {
    const currentBreed = options.current ? decodeURIComponent(options.current) : ''
    const activeCategory = findCategory(currentBreed) || PET_BREED_GROUPS[0].name
    const list = listByCategory(activeCategory)
    const selectedIndex = list.findIndex((item) => item.name === currentBreed)
    this.setData({
      currentBreed,
      activeCategory,
      list
    }, () => {
      if (selectedIndex > 0) {
        wx.nextTick(() => this.setData({ scrollIntoView: `breed-${selectedIndex}` }))
      }
    })
  },

  onCategoryTap(event) {
    const category = event.currentTarget.dataset.name
    this.setData({
      activeCategory: category,
      keyword: '',
      searching: false,
      list: listByCategory(category)
    })
    this.resetScroll()
  },

  onSearchInput(event) {
    const keyword = event.detail.value
    const value = keyword.trim()
    if (!value) {
      this.setData({
        keyword,
        searching: false,
        list: listByCategory(this.data.activeCategory)
      })
    } else {
      this.setData({
        keyword,
        searching: true,
        list: searchBreeds(value)
      })
    }
    this.resetScroll()
  },

  clearSearch() {
    this.setData({
      keyword: '',
      searching: false,
      list: listByCategory(this.data.activeCategory)
    })
    this.resetScroll()
  },

  selectBreed(event) {
    const breed = event.currentTarget.dataset.name
    const channel = this.getOpenerEventChannel ? this.getOpenerEventChannel() : null
    if (channel && typeof channel.emit === 'function') {
      channel.emit('selectBreed', breed)
    }
    wx.navigateBack({ delta: 1 })
  },

  resetScroll() {
    this.setData({ scrollIntoView: '' })
    wx.nextTick(() => this.setData({ scrollIntoView: 'breed-top' }))
  }
})
