//<SvgXml xml={checkIcon('#000')} width={20} height={20}/>

export const checkIcon = (fill = '#000') => {
  return (
    `
<svg  class="icon" viewBox="0 0 1024 1024" width="200" height="200">
    <path d="M369.792 704.32L930.304 128 1024 223.616 369.984 896l-20.288-20.864-0.128 0.128L0 516.8 96.128 423.68l273.664 280.64z"
          fill='${fill}' />
</svg>`
  )
}

export const notice = () => {
  return `
  <svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
  <rect x="4" y="15" width="40" height="26" rx="2" fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"/>
  <path d="M24 7L16 15H32L24 7Z" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 24H30" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 32H20" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  `
}
export const dataAnalysis = (fill = '#000') => {

  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<rect x="4" y="6" width="40" height="30" rx="3" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24 36V43" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M32 14L16 28" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 43H38" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="15" cy="17" r="3" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="33" cy="25" r="3" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  )
}

export const settlementRecord = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<rect x="9" y="8" width="30" height="36" rx="2" fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"/>
<path d="M18 4V10" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M30 4V10" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 19L32 19" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 27L28 27" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 35H24" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  )
}

export const priceAdjustmentRecord = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M19 16L24 22L29 16" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 13.9999C9 13.9999 16.5 2.49984 29.5 6.99986C42.5 11.4999 42 24.4999 42 24.4999" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M39 34C39 34 33 45 19.5 41.5C6 38 6 24 6 24" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M42 8V24" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 24L6 40" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 28H30" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 22H30" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24 22V34" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
  )

}

export const performance = (fill = '#000') => {
  return (
    `
    <svg viewBox="0 0 52.6407 56.2639" fill="${fill}">
      <defs>

        <filter id="filter-1" x="-11.6%" y="-4.5%" width="123.3%" height="109.6%">
          <feMorphology result="shadowSpreadOuter1" radius="1" in="SourceAlpha"/>
          <feOffset result="shadowOffsetOuter1" dy="4" in="shadowSpreadOuter1"/>
          <feGaussianBlur result="shadowBlurOuter1" stdDeviation="10" in="shadowOffsetOuter1"/>
          <feColorMatrix result="shadowMatrixOuter1"
                         values="0 0 0 0 0.19608 0 0 0 0 0.19608 0 0 0 0 0.27843 0 0 0 0.08 0" in="shadowBlurOuter1"/>
          <feOffset result="shadowOffsetOuter2" in="SourceAlpha"/>
          <feGaussianBlur result="shadowBlurOuter2" stdDeviation="0.5" in="shadowOffsetOuter2"/>
          <feColorMatrix result="shadowMatrixOuter2"
                         values="0 0 0 0 0.04706 0 0 0 0 0.10196 0 0 0 0 0.29412 0 0 0 0.1 0" in="shadowBlurOuter2"/>
          <feMerge>
            <feMergeNode in="shadowMatrixOuter1"/>
            <feMergeNode in="shadowMatrixOuter2"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g id="页面-1">
        <g id="_6" data-name="6" >
          <g id="Data">
            <g id="graph-up">
              <g id="Vector-300-_Stroke_" data-name="Vector-300-(Stroke)">
                <path d="M68.02432,27.54276H54.86415a1.76214,1.76214,0,0,0,0,3.51649h9.67273L53.08752,46.03952l-8.587-9.17805a1.50157,1.50157,0,0,0-1.28312-.52747,1.58141,1.58141,0,0,0-1.18441.73846L28.8728,56.41318a1.75511,1.75511,0,0,0,.36191,2.42638,1.51112,1.51112,0,0,0,2.27013-.38682L43.5464,40.79994l8.52121,9.07256A1.51652,1.51652,0,0,0,53.28493,50.4a1.6323,1.6323,0,0,0,1.21731-.633L66.3793,34.2241V43.367a1.64867,1.64867,0,1,0,3.29,0V29.301A1.68788,1.68788,0,0,0,68.02432,27.54276Z"
                      transform="translate(-20.31869 -16.99328)"/>
                <polygon points="52.641 52.747 3.29 52.747 3.29 0 0 0 0 56.264 52.641 56.264 52.641 52.747"/>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
    `
  )
}

export const orderCompensation = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M38 4H10C8.89543 4 8 4.89543 8 6V42C8 43.1046 8.89543 44 10 44H38C39.1046 44 40 43.1046 40 42V6C40 4.89543 39.1046 4 38 4Z" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17 30L31 30" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17 36H24" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19 17L29 17" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24 22V12" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    `
  )
}

export const achievement = () => {
  return (
    `
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
    <path d="M6 6V42H42" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 34L22 18L32 27L42 6" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `
  )
}
export const shopManagement = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M40.0391 22V42H8.03906V22" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.84231 13.7766C4.31276 17.7377 7.26307 22 11.5092 22C14.8229 22 17.5276 19.3137 17.5276 16C17.5276 19.3137 20.2139 22 23.5276 22H24.546C27.8597 22 30.546 19.3137 30.546 16C30.546 19.3137 33.2518 22 36.5655 22C40.8139 22 43.767 17.7352 42.2362 13.7723L39.2337 6H8.84523L5.84231 13.7766Z" fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"/>
</svg>
  `
  )
}

export const expenseBill = (fill = '#000') => {
  return (`
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M10 6C10 4.89543 10.8954 4 12 4H36C37.1046 4 38 4.89543 38 6V44L31 39L24 44L17 39L10 44V6Z" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 22L30 22" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 30L30 30" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 14L30 14" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

  `)
}

export const messageRingtone = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M24 6V42C17 42 11.7985 32.8391 11.7985 32.8391H6C4.89543 32.8391 4 31.9437 4 30.8391V17.0108C4 15.9062 4.89543 15.0108 6 15.0108H11.7985C11.7985 15.0108 17 6 24 6Z" fill="none" stroke="${fill}" stroke-width="2" stroke-linejoin="round"/>
<path d="M32 15L32 15C32.6232 15.5565 33.1881 16.1797 33.6841 16.8588C35.1387 18.8504 36 21.3223 36 24C36 26.6545 35.1535 29.1067 33.7218 31.0893C33.2168 31.7885 32.6391 32.4293 32 33" stroke="${fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M34.2359 41.1857C40.0836 37.6953 44 31.305 44 24C44 16.8085 40.2043 10.5035 34.507 6.97906" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
</svg>
    `
  )
}

export const platformSettings = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M18 6H8C6.89543 6 6 6.89543 6 8V18C6 19.1046 6.89543 20 8 20H18C19.1046 20 20 19.1046 20 18V8C20 6.89543 19.1046 6 18 6Z" fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"/>
<path d="M18 28H8C6.89543 28 6 28.8954 6 30V40C6 41.1046 6.89543 42 8 42H18C19.1046 42 20 41.1046 20 40V30C20 28.8954 19.1046 28 18 28Z" fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"/>
<path d="M40 6H30C28.8954 6 28 6.89543 28 8V18C28 19.1046 28.8954 20 30 20H40C41.1046 20 42 19.1046 42 18V8C42 6.89543 41.1046 6 40 6Z" fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"/>
<path d="M40 28H30C28.8954 28 28 28.8954 28 30V40C28 41.1046 28.8954 42 30 42H40C41.1046 42 42 41.1046 42 40V30C42 28.8954 41.1046 28 40 28Z" fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"/>
</svg>
    `
  )
}

export const wallet = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<rect x="5" y="13" width="38" height="26" rx="2" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="25" y="20" width="18" height="11" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M43 18L43 33" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M32 13C32 8 28.5 7 27 7C23.6667 7 16.1 7 12.5 7C8.9 7 8 9.86567 8 11.2985V13" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="33.5" cy="25.5" r="1.5" fill="#333"/>
</svg>
  `)
}

export const deliveryManagement = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M12 39C14.2091 39 16 37.2091 16 35C16 32.7909 14.2091 31 12 31C9.79086 31 8 32.7909 8 35C8 37.2091 9.79086 39 12 39Z" stroke="#333" stroke-width="2" stroke-linejoin="round"/>
<path d="M35 39C37.2091 39 39 37.2091 39 35C39 32.7909 37.2091 31 35 31C32.7909 31 31 32.7909 31 35C31 37.2091 32.7909 39 35 39Z" stroke="#333" stroke-width="2" stroke-linejoin="round"/>
<path d="M8 35H2V11H31V35H16" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M31 35V18H39.5714L46 26.5V35H39.8112" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    `
  )
}

export const printSettings = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M38 20V8C38 6.89543 37.1046 6 36 6H12C10.8954 6 10 6.89543 10 8V20" stroke="#333" stroke-width="2" stroke-linecap="round"/>
<rect x="6" y="20" width="36" height="22" rx="2" stroke="#333" stroke-width="2"/>
<path d="M20 34H35V42H20V34Z" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 26H15" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
  )
}

export const orderSearch = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M40 27V6C40 4.89543 39.1046 4 38 4H10C8.89543 4 8 4.89543 8 6V42C8 43.1046 8.89543 44 10 44H21" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17 12L31 12" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17 20L31 20" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17 28H23" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M37 37C37 38.3807 36.4404 39.6307 35.5355 40.5355C34.6307 41.4404 33.3807 42 32 42C29.2386 42 27 39.7614 27 37C27 34.2386 29.2386 32 32 32C34.7614 32 37 34.2386 37 37Z" fill="none"/>
<path d="M39 44L35.5355 40.5355M35.5355 40.5355C36.4404 39.6307 37 38.3807 37 37C37 34.2386 34.7614 32 32 32C29.2386 32 27 34.2386 27 37C27 39.7614 29.2386 42 32 42C33.3807 42 34.6307 41.4404 35.5355 40.5355Z" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    `
  )
}

export const commodityAdjustment = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M24 16H29V4L44 19L29 34V24H18V13L4 28L18 44V32H23" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
  `
  )
}

export const pushSettings = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M41.5 10H35.5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M27.5 6V14" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M27.5 10L5.5 10" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.5 24H5.5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M21.5 20V28" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M43.5 24H21.5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M41.5 38H35.5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M27.5 34V42" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M27.5 38H5.5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    `
  )
}

export const shareActivity = (fill = '#000') => {
  return (`
<svg width="24" height="24" viewBox="0 0 48 48" fill="none">
<path d="M41 44V20H7V44H41Z" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24 44V20" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M41 44H7" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="4" y="12" width="40" height="8" fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"/>
<path d="M16 4L24 12L32 4" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

  `)
}

export const help = (fill = '#000') => {
  return (`

<svg width="24" height="24" viewBox="0 0 48 48" fill="none">
<path d="M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z" fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"/>
<path d="M24 28.6248V24.6248C27.3137 24.6248 30 21.9385 30 18.6248C30 15.3111 27.3137 12.6248 24 12.6248C20.6863 12.6248 18 15.3111 18 18.6248" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M24 37.6248C25.3807 37.6248 26.5 36.5055 26.5 35.1248C26.5 33.7441 25.3807 32.6248 24 32.6248C22.6193 32.6248 21.5 33.7441 21.5 35.1248C21.5 36.5055 22.6193 37.6248 24 37.6248Z" fill="#333"/>
</svg>

  `)
}

export const contactCustomerService = (fill = '#000') => {
  return (
    `
<svg  viewBox="0 0 1024 1024"  width="200" height="200">
<path d="M894.1 355.6h-1.7C853 177.6 687.6 51.4 498.1 54.9S148.2 190.5 115.9 369.7c-35.2 5.6-61.1 36-61.1 71.7v143.4c0.9 40.4 34.3 72.5 74.7 71.7 21.7-0.3 42.2-10 56-26.7 33.6 84.5 99.9 152 183.8 187 1.1-2 2.3-3.9 3.7-5.7 0.9-1.5 2.4-2.6 4.1-3 1.3 0 2.5 0.5 3.6 1.2a318.46 318.46 0 0 1-105.3-187.1c-5.1-44.4 24.1-85.4 67.6-95.2 64.3-11.7 128.1-24.7 192.4-35.9 37.9-5.3 70.4-29.8 85.7-64.9 6.8-15.9 11-32.8 12.5-50 0.5-3.1 2.9-5.6 5.9-6.2 3.1-0.7 6.4 0.5 8.2 3l1.7-1.1c25.4 35.9 74.7 114.4 82.7 197.2 8.2 94.8 3.7 160-71.4 226.5-1.1 1.1-1.7 2.6-1.7 4.1 0.1 2 1.1 3.8 2.8 4.8h4.8l3.2-1.8c75.6-40.4 132.8-108.2 159.9-189.5 11.4 16.1 28.5 27.1 47.8 30.8C846 783.9 716.9 871.6 557.2 884.9c-12-28.6-42.5-44.8-72.9-38.6-33.6 5.4-56.6 37-51.2 70.6 4.4 27.6 26.8 48.8 54.5 51.6 30.6 4.6 60.3-13 70.8-42.2 184.9-14.5 333.2-120.8 364.2-286.9 27.8-10.8 46.3-37.4 46.6-67.2V428.7c-0.1-19.5-8.1-38.2-22.3-51.6-14.5-13.8-33.8-21.4-53.8-21.3l1-0.2zM825.9 397c-71.1-176.9-272.1-262.7-449-191.7-86.8 34.9-155.7 103.4-191 190-2.5-2.8-5.2-5.4-8-7.9 25.3-154.6 163.8-268.6 326.8-269.2s302.3 112.6 328.7 267c-2.9 3.8-5.4 7.7-7.5 11.8z" fill="#2c2c2c">
</path>
</svg>
    `
  )
}

export const versionInformation = (fill = '#000') => {
  return (
    `
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
    <path d="M12 33H4V7H44V33H36H12Z" fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"/>
    <path d="M16 22V26" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24 33V39" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24 18V26" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M32 14V26" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 41H36" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `
  )
}

export const settings = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M18.2838 43.1713C14.9327 42.1736 11.9498 40.3213 9.58787 37.867C10.469 36.8227 11 35.4734 11 34.0001C11 30.6864 8.31371 28.0001 5 28.0001C4.79955 28.0001 4.60139 28.01 4.40599 28.0292C4.13979 26.7277 4 25.3803 4 24.0001C4 21.9095 4.32077 19.8938 4.91579 17.9995C4.94381 17.9999 4.97188 18.0001 5 18.0001C8.31371 18.0001 11 15.3138 11 12.0001C11 11.0488 10.7786 10.1493 10.3846 9.35011C12.6975 7.1995 15.5205 5.59002 18.6521 4.72314C19.6444 6.66819 21.6667 8.00013 24 8.00013C26.3333 8.00013 28.3556 6.66819 29.3479 4.72314C32.4795 5.59002 35.3025 7.1995 37.6154 9.35011C37.2214 10.1493 37 11.0488 37 12.0001C37 15.3138 39.6863 18.0001 43 18.0001C43.0281 18.0001 43.0562 17.9999 43.0842 17.9995C43.6792 19.8938 44 21.9095 44 24.0001C44 25.3803 43.8602 26.7277 43.594 28.0292C43.3986 28.01 43.2005 28.0001 43 28.0001C39.6863 28.0001 37 30.6864 37 34.0001C37 35.4734 37.531 36.8227 38.4121 37.867C36.0502 40.3213 33.0673 42.1736 29.7162 43.1713C28.9428 40.752 26.676 39.0001 24 39.0001C21.324 39.0001 19.0572 40.752 18.2838 43.1713Z" fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"/>
<path d="M24 31C27.866 31 31 27.866 31 24C31 20.134 27.866 17 24 17C20.134 17 17 20.134 17 24C17 27.866 20.134 31 24 31Z" fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"/>
</svg>
    `
  )
}

export const user = (background = '#ccc', fill = '#FFF') => {
  return (
    `
    <svg  viewBox="0 0 1024 1024"  width="512" height="512">
    <path d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="${background}"/>
    <path d="M379.3 469.2c35.4 34.5 82.4 53.4 132.4 53.4s97-18.9 132.4-53.4c35.5-34.6 55.1-80.5 55.1-129.4S679.5 245 644 210.4C608.6 176 561.7 157 511.6 157s-97 18.9-132.4 53.4c-35.5 34.6-55.1 80.5-55.1 129.4 0.1 49 19.6 94.9 55.2 129.4z m132.3-277.5c84.3 0 152.8 66.5 152.8 148.2s-68.5 148.3-152.8 148.3S358.8 421.6 358.8 340s68.5-148.3 152.8-148.3zM810.5 690.5c-16.6-29.2-40.4-55.1-70.7-77.5-61.1-45.1-142-69.8-227.8-69.8-53.1 0-104.4 9.5-150.2 27.4-0.8 0.2-1.6 0.6-2.4 0.9-27.3 10.9-52.6 24.9-75.2 41.4-30.2 22.3-54 48.3-70.7 77.5C196 721 187 753.6 187 787.3c0 9.5 7.8 17.2 17.3 17.2s17.3-7.7 17.3-17.2c0-55 29.6-107.1 83.1-146.7 16.9-12.5 35.7-23.3 55.7-32.2L491 799.2c0 0.1 0.1 0.1 0.1 0.2 0.1 0.2 0.2 0.3 0.3 0.4 0.2 0.3 0.5 0.6 0.7 0.9l0.2 0.2c0.3 0.4 0.7 0.7 1.1 1.1 0.1 0.1 0.2 0.1 0.2 0.2 0.7 0.6 1.5 1.3 2.4 1.9 0.1 0.1 0.2 0.1 0.2 0.2 0.4 0.2 0.7 0.5 1.1 0.6 0 0 0.1 0 0.1 0.1 0.4 0.2 0.7 0.4 1.1 0.6 0.2 0.1 0.3 0.2 0.5 0.2 0.2 0.1 0.5 0.2 0.7 0.2 0.2 0.1 0.4 0.2 0.6 0.2 0.2 0.1 0.5 0.2 0.7 0.2 0.2 0.1 0.6 0.2 0.7 0.2 0.2 0.1 0.6 0.1 0.7 0.2 0.2 0 0.4 0.1 0.6 0.1 0.2 0 0.5 0.1 0.7 0.1 0.2 0 0.3 0 0.5 0.1 0.4 0 0.7 0.1 1.1 0.1h1.1c0.2 0 0.3 0 0.6-0.1 0.2 0 0.4-0.1 0.6-0.1 0.2 0 0.4-0.1 0.6-0.1 0.2 0 0.4-0.1 0.6-0.1 0.2-0.1 0.6-0.1 0.7-0.2 0.2-0.1 0.6-0.2 0.7-0.2 0.2-0.1 0.3-0.1 0.5-0.2s0.5-0.2 0.7-0.2c0.2-0.1 0.3-0.1 0.4-0.2 0.3-0.2 0.6-0.2 0.9-0.4 0.1 0 0.1-0.1 0.2-0.1 0.4-0.2 0.7-0.4 1.1-0.6h0.1c0.4-0.2 0.7-0.5 1.1-0.6h0.1c0.5-0.3 0.9-0.6 1.3-1 0.1 0 0.1-0.1 0.2-0.1 0.4-0.3 0.7-0.6 1.1-1.1 0.1-0.1 0.1-0.1 0.1-0.2 0.3-0.3 0.6-0.6 0.8-1 0.1-0.2 0.2-0.2 0.3-0.4 0-0.1 0.1-0.1 0.1-0.2L664.7 609c19.6 8.9 37.8 19.4 54.4 31.7 53.6 39.5 83.1 91.5 83.1 146.7 0 9.5 7.8 17.2 17.3 17.2s17.3-7.7 17.3-17.2c0.2-33.6-8.8-66.2-26.3-96.9z m-304.3 69.7L393.7 595.9c36.8-11.9 76.8-18.2 118.3-18.2 41.8 0 82.2 6.3 119.2 18.4l-125 164.1z" fill="${fill}" />
    </svg>
    `
  )
}

export const employeeManagement = () => {
  return (
    `
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
    <path d="M24 20C27.866 20 31 16.866 31 13C31 9.13401 27.866 6 24 6C20.134 6 17 9.13401 17 13C17 16.866 20.134 20 24 20Z" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 40.8V42H42V40.8C42 36.3196 42 34.0794 41.1281 32.3681C40.3611 30.8628 39.1372 29.6389 37.6319 28.8719C35.9206 28 33.6804 28 29.2 28H18.8C14.3196 28 12.0794 28 10.3681 28.8719C8.86278 29.6389 7.63893 30.8628 6.87195 32.3681C6 34.0794 6 36.3196 6 40.8Z" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `
  )
}

export const operatingIncome = () => {
  return (
    `
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
    <path d="M35 38L30 33L34.9996 28" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M43 38L38 33L42.9996 28" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M43 22V9C43 7.89543 42.1046 7 41 7H7C5.89543 7 5 7.89543 5 9V39C5 40.1046 5.89543 41 7 41H28.4706" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13 15L18 21L23 15" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 27H24" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 21H24" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 21V33" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `
  )
}

export const stallIcon = () => {
  return (
    `
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
    <path d="M4 5H44V13L42.6015 13.8391C40.3847 15.1692 37.6153 15.1692 35.3985 13.8391L34 13L32.6015 13.8391C30.3847 15.1692 27.6153 15.1692 25.3985 13.8391L24 13L22.6015 13.8391C20.3847 15.1692 17.6153 15.1692 15.3985 13.8391L14 13L12.6015 13.8391C10.3847 15.1692 7.61531 15.1692 5.39853 13.8391L4 13V5Z" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="6" y="25" width="36" height="18" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 16V25" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M39 16V25" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  )
}

export const switchStore = (fill = '#333', width = 24, height = 24) => {
  return (
    `
    <svg width="${width}" height="${height}" viewBox="0 0 48 48" fill="${fill}">
    <path d="M42 19H5.99998" stroke="${fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M30 7L42 19" stroke="${fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.79897 29H42.799" stroke="${fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.79895 29L18.799 41" stroke="${fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  )
}

export const rightArrow = (fill = '#333', width = 24, height = 24) => {
  return (
    `
    <svg width="${width}" height="${height}" viewBox="0 0 48 48">
    <path d="M19 12L31 24L19 36" stroke="${fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  )
}

export const pencilIcon = (fill = '#333', width = 24, height = 24) => {
  return (
    `
    <svg width="${width}" height="${height}" viewBox="0 0 48 48">
    <path d="M42 26V40C42 41.1046 41.1046 42 40 42H8C6.89543 42 6 41.1046 6 40V8C6 6.89543 6.89543 6 8 6L22 6" stroke="${fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 26.7199V34H21.3172L42 13.3081L34.6951 6L14 26.7199Z" fill="none" stroke="${fill}" stroke-width="2" stroke-linejoin="round"/>
    </svg>`
  )
}

export const delivery = (stroke = '#333333', width = 24, height = 24) => {
  return (
    `
    <svg width="${width}" height="${height}" viewBox="0 0 48 48" fill="none" >
    <path d="M36 8H9C7.34315 8 6 9.34315 6 11V39C6 40.6569 7.34315 42 9 42H39C40.6569 42 42 40.6569 42 39V25V18" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M32.2427 12.4854L36.4853 8.24271L32.2427 4.00007" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24 17V34" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M32 24V34" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 24V34" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `
  )
}
