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
  <rect x="4" y="15" width="40" height="26" rx="2" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
  <path d="M24 7L16 15H32L24 7Z" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 24H30" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 32H20" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  `
}
export const dataAnalysis = (fill = '#000') => {

  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<rect x="4" y="6" width="40" height="30" rx="3" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24 36V43" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M32 14L16 28" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 43H38" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="15" cy="17" r="3" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="33" cy="25" r="3" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  )
}

export const settlementRecord = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<rect x="9" y="8" width="30" height="36" rx="2" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
<path d="M18 4V10" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M30 4V10" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 19L32 19" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 27L28 27" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 35H24" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  )
}

export const priceAdjustmentRecord = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M19 16L24 22L29 16" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 13.9999C9 13.9999 16.5 2.49984 29.5 6.99986C42.5 11.4999 42 24.4999 42 24.4999" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M39 34C39 34 33 45 19.5 41.5C6 38 6 24 6 24" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M42 8V24" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 24L6 40" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 28H30" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 22H30" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24 22V34" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
  )

}

export const performance = (fill = '#000') => {
  return (
    `
    <svg viewBox="0 0 52.6407 56.2639" fill="${fill}">
      <defs>
        <filter x="-11.6%" y="-4.5%" width="123.3%" height="109.6%">
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
      <g>
        <g  data-name="6" >
          <g >
            <g >
              <g  data-name="Vector-300-(Stroke)">
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
<path d="M38 4H10C8.89543 4 8 4.89543 8 6V42C8 43.1046 8.89543 44 10 44H38C39.1046 44 40 43.1046 40 42V6C40 4.89543 39.1046 4 38 4Z" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17 30L31 30" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17 36H24" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19 17L29 17" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24 22V12" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    `
  )
}

export const achievement = () => {
  return (
    `
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
    <path d="M6 6V42H42" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 34L22 18L32 27L42 6" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `
  )
}
export const shopManagement = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M40.0391 22V42H8.03906V22" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.84231 13.7766C4.31276 17.7377 7.26307 22 11.5092 22C14.8229 22 17.5276 19.3137 17.5276 16C17.5276 19.3137 20.2139 22 23.5276 22H24.546C27.8597 22 30.546 19.3137 30.546 16C30.546 19.3137 33.2518 22 36.5655 22C40.8139 22 43.767 17.7352 42.2362 13.7723L39.2337 6H8.84523L5.84231 13.7766Z" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
</svg>
  `
  )
}

export const expenseBill = (fill = '#000') => {
  return (`
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M10 6C10 4.89543 10.8954 4 12 4H36C37.1046 4 38 4.89543 38 6V44L31 39L24 44L17 39L10 44V6Z" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 22L30 22" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 30L30 30" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 14L30 14" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

  `)
}

export const messageRingtone = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M24 6V42C17 42 11.7985 32.8391 11.7985 32.8391H6C4.89543 32.8391 4 31.9437 4 30.8391V17.0108C4 15.9062 4.89543 15.0108 6 15.0108H11.7985C11.7985 15.0108 17 6 24 6Z" fill="none" stroke="${fill}" stroke-width="4" stroke-linejoin="round"/>
<path d="M32 15L32 15C32.6232 15.5565 33.1881 16.1797 33.6841 16.8588C35.1387 18.8504 36 21.3223 36 24C36 26.6545 35.1535 29.1067 33.7218 31.0893C33.2168 31.7885 32.6391 32.4293 32 33" stroke="${fill}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M34.2359 41.1857C40.0836 37.6953 44 31.305 44 24C44 16.8085 40.2043 10.5035 34.507 6.97906" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
</svg>
    `
  )
}

export const platformSettings = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M18 6H8C6.89543 6 6 6.89543 6 8V18C6 19.1046 6.89543 20 8 20H18C19.1046 20 20 19.1046 20 18V8C20 6.89543 19.1046 6 18 6Z" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
<path d="M18 28H8C6.89543 28 6 28.8954 6 30V40C6 41.1046 6.89543 42 8 42H18C19.1046 42 20 41.1046 20 40V30C20 28.8954 19.1046 28 18 28Z" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
<path d="M40 6H30C28.8954 6 28 6.89543 28 8V18C28 19.1046 28.8954 20 30 20H40C41.1046 20 42 19.1046 42 18V8C42 6.89543 41.1046 6 40 6Z" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
<path d="M40 28H30C28.8954 28 28 28.8954 28 30V40C28 41.1046 28.8954 42 30 42H40C41.1046 42 42 41.1046 42 40V30C42 28.8954 41.1046 28 40 28Z" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
</svg>
    `
  )
}

export const wallet = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<rect x="5" y="13" width="38" height="26" rx="2" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="25" y="20" width="18" height="11" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M43 18L43 33" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M32 13C32 8 28.5 7 27 7C23.6667 7 16.1 7 12.5 7C8.9 7 8 9.86567 8 11.2985V13" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="33.5" cy="25.5" r="1.5" fill="#333"/>
</svg>
  `)
}

export const deliveryManagement = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M12 39C14.2091 39 16 37.2091 16 35C16 32.7909 14.2091 31 12 31C9.79086 31 8 32.7909 8 35C8 37.2091 9.79086 39 12 39Z" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
<path d="M35 39C37.2091 39 39 37.2091 39 35C39 32.7909 37.2091 31 35 31C32.7909 31 31 32.7909 31 35C31 37.2091 32.7909 39 35 39Z" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
<path d="M8 35H2V11H31V35H16" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M31 35V18H39.5714L46 26.5V35H39.8112" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    `
  )
}

export const printSettings = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M38 20V8C38 6.89543 37.1046 6 36 6H12C10.8954 6 10 6.89543 10 8V20" stroke="#333" stroke-width="4" stroke-linecap="round"/>
<rect x="6" y="20" width="36" height="22" rx="2" stroke="#333" stroke-width="4"/>
<path d="M20 34H35V42H20V34Z" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 26H15" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
  )
}

export const orderSearch = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M40 27V6C40 4.89543 39.1046 4 38 4H10C8.89543 4 8 4.89543 8 6V42C8 43.1046 8.89543 44 10 44H21" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17 12L31 12" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17 20L31 20" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17 28H23" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M37 37C37 38.3807 36.4404 39.6307 35.5355 40.5355C34.6307 41.4404 33.3807 42 32 42C29.2386 42 27 39.7614 27 37C27 34.2386 29.2386 32 32 32C34.7614 32 37 34.2386 37 37Z" fill="none"/>
<path d="M39 44L35.5355 40.5355M35.5355 40.5355C36.4404 39.6307 37 38.3807 37 37C37 34.2386 34.7614 32 32 32C29.2386 32 27 34.2386 27 37C27 39.7614 29.2386 42 32 42C33.3807 42 34.6307 41.4404 35.5355 40.5355Z" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    `
  )
}

export const commodityAdjustment = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M24 16H29V4L44 19L29 34V24H18V13L4 28L18 44V32H23" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
  `
  )
}

export const pushSettings = (fill = '#000') => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M41.5 10H35.5" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M27.5 6V14" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M27.5 10L5.5 10" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.5 24H5.5" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M21.5 20V28" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M43.5 24H21.5" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M41.5 38H35.5" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M27.5 34V42" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M27.5 38H5.5" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    `
  )
}

export const shareActivity = (fill = '#000') => {
  return (`
<svg width="24" height="24" viewBox="0 0 48 48" fill="none">
<path d="M41 44V20H7V44H41Z" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24 44V20" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M41 44H7" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="4" y="12" width="40" height="8" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
<path d="M16 4L24 12L32 4" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

  `)
}

export const help = (fill = '#000') => {
  return (`

<svg width="24" height="24" viewBox="0 0 48 48" fill="none">
<path d="M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
<path d="M24 28.6248V24.6248C27.3137 24.6248 30 21.9385 30 18.6248C30 15.3111 27.3137 12.6248 24 12.6248C20.6863 12.6248 18 15.3111 18 18.6248" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
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
    <path d="M12 33H4V7H44V33H36H12Z" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
    <path d="M16 22V26" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24 33V39" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24 18V26" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M32 14V26" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 41H36" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `
  )
}

export const settings = (fill = '#000', width = 24, height = 24) => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
<path d="M18.2838 43.1713C14.9327 42.1736 11.9498 40.3213 9.58787 37.867C10.469 36.8227 11 35.4734 11 34.0001C11 30.6864 8.31371 28.0001 5 28.0001C4.79955 28.0001 4.60139 28.01 4.40599 28.0292C4.13979 26.7277 4 25.3803 4 24.0001C4 21.9095 4.32077 19.8938 4.91579 17.9995C4.94381 17.9999 4.97188 18.0001 5 18.0001C8.31371 18.0001 11 15.3138 11 12.0001C11 11.0488 10.7786 10.1493 10.3846 9.35011C12.6975 7.1995 15.5205 5.59002 18.6521 4.72314C19.6444 6.66819 21.6667 8.00013 24 8.00013C26.3333 8.00013 28.3556 6.66819 29.3479 4.72314C32.4795 5.59002 35.3025 7.1995 37.6154 9.35011C37.2214 10.1493 37 11.0488 37 12.0001C37 15.3138 39.6863 18.0001 43 18.0001C43.0281 18.0001 43.0562 17.9999 43.0842 17.9995C43.6792 19.8938 44 21.9095 44 24.0001C44 25.3803 43.8602 26.7277 43.594 28.0292C43.3986 28.01 43.2005 28.0001 43 28.0001C39.6863 28.0001 37 30.6864 37 34.0001C37 35.4734 37.531 36.8227 38.4121 37.867C36.0502 40.3213 33.0673 42.1736 29.7162 43.1713C28.9428 40.752 26.676 39.0001 24 39.0001C21.324 39.0001 19.0572 40.752 18.2838 43.1713Z" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
<path d="M24 31C27.866 31 31 27.866 31 24C31 20.134 27.866 17 24 17C20.134 17 17 20.134 17 24C17 27.866 20.134 31 24 31Z" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
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
    <path d="M24 20C27.866 20 31 16.866 31 13C31 9.13401 27.866 6 24 6C20.134 6 17 9.13401 17 13C17 16.866 20.134 20 24 20Z" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 40.8V42H42V40.8C42 36.3196 42 34.0794 41.1281 32.3681C40.3611 30.8628 39.1372 29.6389 37.6319 28.8719C35.9206 28 33.6804 28 29.2 28H18.8C14.3196 28 12.0794 28 10.3681 28.8719C8.86278 29.6389 7.63893 30.8628 6.87195 32.3681C6 34.0794 6 36.3196 6 40.8Z" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `
  )
}

export const operatingIncome = () => {
  return (
    `
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
    <path d="M35 38L30 33L34.9996 28" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M43 38L38 33L42.9996 28" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M43 22V9C43 7.89543 42.1046 7 41 7H7C5.89543 7 5 7.89543 5 9V39C5 40.1046 5.89543 41 7 41H28.4706" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13 15L18 21L23 15" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 27H24" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 21H24" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 21V33" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `
  )
}

export const stallIcon = () => {
  return (
    `
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" >
    <path d="M4 5H44V13L42.6015 13.8391C40.3847 15.1692 37.6153 15.1692 35.3985 13.8391L34 13L32.6015 13.8391C30.3847 15.1692 27.6153 15.1692 25.3985 13.8391L24 13L22.6015 13.8391C20.3847 15.1692 17.6153 15.1692 15.3985 13.8391L14 13L12.6015 13.8391C10.3847 15.1692 7.61531 15.1692 5.39853 13.8391L4 13V5Z" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="6" y="25" width="36" height="18" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 16V25" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M39 16V25" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  )
}

export const switchStore = (fill = '#333', width = 24, height = 24) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" >
   
    <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g  transform="translate(-295.000000, -59.000000)" fill-rule="nonzero">
            <g  transform="translate(295.000000, 58.000000)">
                <g  transform="translate(0.000000, 1.000000)">
                    <rect  fill="${fill}" opacity="0" x="0" y="0" width="16" height="16"></rect>
                    <path d="M11.4775,9.0005 C11.5738562,8.99588599 11.6692131,9.02178105 11.75,9.0745 C11.87,9.1515 11.9505,9.276 11.9835,9.414 C12.018137,9.55544208 12.000375,9.70464269 11.9335,9.834 L10.4335,11.722 C10.295,11.988 9.989,12.079 9.75,11.9255 C9.511,11.772 9.429,11.432 9.567,11.166 L10.417,10.096 L4.5485,10.096 C4.24584796,10.096 4.0005,9.85065204 4.0005,9.548 C4.0005,9.24534796 4.24584796,8.99997505 4.5485,8.99997505 L11.4525,8.99997505 L11.478,9.0005 L11.4775,9.0005 Z M4.5225,7 C4.42614375,7.00461401 4.33078693,6.97871895 4.25,6.926 C4.1311894,6.84728971 4.04749803,6.72560568 4.0165,6.5865 C3.98186302,6.44505792 3.999625,6.29585731 4.0665,6.1665 L5.567,4.2785 C5.705,4.0125 6.011,3.9215 6.25,4.075 C6.489,4.2285 6.571,4.5685 6.433,4.8345 L5.583,5.9045 L11.452,5.9045 C11.6477815,5.90449999 11.8286912,6.0089482 11.9265819,6.17849999 C12.0244727,6.34805179 12.0244727,6.55694821 11.9265819,6.72650001 C11.8286912,6.8960518 11.6477815,7.00052495 11.452,7.00052495 L4.548,7.00052495 L4.523,7 L4.5225,7 Z M1,1.995 C1,1.4455 1.45,1 1.9955,1 L14.005,1 C14.5545,1 15,1.45 15,1.9955 L15,14.005 C15,14.555 14.55,15.0005 14.0045,15.0005 L1.995,15.0005 C1.4455,15 1,14.55 1,14.0045 L1,1.995 Z M1.999999,2.5 L1.999999,13.499 C1.99973444,13.6317814 2.0522956,13.7592154 2.14609259,13.8532 C2.23988957,13.9471846 2.36721831,14 2.499999,14 L13.499999,14 C13.7761424,14 13.999999,13.7761424 13.999999,13.5 L13.999999,2.5 C13.999999,2.22385763 13.7761424,2 13.499999,2 L2.499999,2 C2.22385763,2 1.999999,2.22385763 1.999999,2.5 Z" id="形状" fill="#59B26A"></path>
                </g>
            </g>
        </g>
    </g>
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
    <path d="M42 26V40C42 41.1046 41.1046 42 40 42H8C6.89543 42 6 41.1046 6 40V8C6 6.89543 6.89543 6 8 6L22 6" stroke="${fill}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 26.7199V34H21.3172L42 13.3081L34.6951 6L14 26.7199Z" fill="none" stroke="${fill}" stroke-width="4" stroke-linejoin="round"/>
    </svg>`
  )
}

export const delivery = (stroke = '#333333', width = 24, height = 24) => {
  return (
    `
    <svg width="${width}" height="${height}" viewBox="0 0 48 48" fill="none" >
    <path d="M36 8H9C7.34315 8 6 9.34315 6 11V39C6 40.6569 7.34315 42 9 42H39C40.6569 42 42 40.6569 42 39V25V18" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M32.2427 12.4854L36.4853 8.24271L32.2427 4.00007" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24 17V34" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M32 24V34" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 24V34" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `
  )
}

export const hotUpdateHeader = (width = 274, height = 105) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 274 105" >
    <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g  transform="translate(-52.000000, -240.000000)">
            <g  transform="translate(52.000000, 240.000000)">
                <path d="M8.0426494,0 L263.499929,-4.93765857e-16 C267.060377,2.8645485e-16 268.351596,0.369810262 269.653953,1.06472931 C270.956309,1.75964836 271.979153,2.77967619 272.677661,4.08011133 C273.376169,5.38054648 273.749538,6.6707412 273.759356,10.2311758 L274,97.5008244 L274,97.5008244 C249.391992,99.6957411 224.375166,98.6414695 198.949521,94.3380095 C186.291961,94.8387794 172.599516,92.8759044 160.491438,89.9014709 C144.604105,88.7337527 122.593977,92.9567393 94.8540481,97.1125321 C84.1597811,98.8362632 76.4842522,99.6228318 60.2667444,99.3598422 C39.0123133,99.9646939 19.0770972,95.7515521 0.461095873,86.7204167 L0.0427624794,8.04253571 C0.0192706532,3.62432017 3.58189814,0.0236049074 8.00011368,0.000113081235 C8.01429213,3.76938781e-05 8.02847075,5.33167509e-15 8.0426494,0 Z"  fill="#AAEACE"></path>
                <path d="M12.3377045,-4.09498593e-16 L262.603348,2.24996786e-15 C266.076025,-1.27368311e-15 267.336914,0.346865433 268.61767,1.00600842 C269.898426,1.6651514 270.915565,2.63657194 271.632872,3.88568214 C272.350179,5.13479235 272.754626,6.37840796 272.914221,9.84741523 L273.744344,27.8911182 C273.897944,31.2348943 271.953528,34.3207714 268.871242,35.6261258 C186.395617,70.512268 128.220445,88.3537739 94.3457271,89.1506434 C62.0222649,89.9110211 32.4296136,85.6447463 5.56777328,76.3518191 C2.25412985,75.2079854 0.0720937138,72.0394239 0.184094982,68.5357055 L2.04183863,9.97442869 C2.15286289,6.47463331 2.54732791,5.21557862 3.25869088,3.94951332 C3.97005384,2.68344802 4.98925155,1.69606969 6.27723555,1.02520769 C7.56521955,0.35434568 8.83614854,2.337268e-16 12.3377045,-4.09498593e-16 Z"  fill="#4FD29C"></path>
                <path d="M10.4756624,-4.95229812e-15 L263.593496,1.5520266e-14 C267.15515,-9.00692333e-15 268.446782,0.370129831 269.749427,1.06554362 C271.052073,1.76095741 272.074984,2.78165517 272.773218,4.08279101 C273.471452,5.38392686 273.84438,6.67475421 273.852096,10.2363999 L274,78.5083185 L274,78.5083185 C237.479849,91.5164034 205.548705,96.396675 178.206568,93.1491333 C146.852848,87.57076 143.84745,69.0240628 79.4798719,72.7795343 C44.6158972,77.2330849 18.1226066,82.6390544 0,88.9974429 L0.216252179,10.2312818 C0.226027406,6.67082255 0.599387798,5.380615 1.29788987,4.08016565 C1.99639194,2.7797163 3.01923772,1.75967489 4.32159989,1.06474581 C5.62396207,0.369816738 6.91518981,2.87306061e-15 10.4756624,-4.95229812e-15 Z" fill="#59B26A"></path>
                <g  transform="translate(82.000000, 13.000000)">
                    <path d="M123.971709,46 C123.971709,46 115.1943,60.0954544 105.950339,67.5718001 C91.0393193,79.6331325 68.8998455,76.3753788 63.8797401,79.3621268 C61.30437,80.892772 92.5719394,79.7174385 104.074015,82.2948352 C115.022448,84.7522062 126.508459,89.6998296 126.508459,89.6998296 C126.508459,89.6998296 114.740189,88.3924912 123.250107,68.7543704 C129.022918,55.4251862 130.833141,51.5173979 130.833141,51.5173979 L123.971709,46 Z"  fill="#FFFFFF" opacity="0.5"></path>
                    <path d="M126.865755,48 C126.865755,48 118.31045,61.9777401 110.234939,70.0899575 C96.6386715,83.7497332 74.7429956,84.8570276 69.714495,87.8576975 C67.1348181,89.3954774 119.420001,91.474087 119.420001,91.474087 C119.420001,91.474087 112.260048,87.8331322 120.777967,68.1091853 C126.566662,54.7178705 130,50.4865958 130,50.4865958 L126.865755,48 Z" fill="#FFFFFF" opacity="0.75"></path>
                    <path d="M14.1141347,58.9210964 C18.4072787,60.1802996 21.5306957,63.9418109 22.0278625,68.4515488 C22.5250294,72.9612866 20.2980311,77.3310758 16.3853695,79.5231804 C12.4727079,81.7152849 7.64496647,81.2979785 4.15343501,78.4658609 C0.661903547,75.6337433 -0.805774468,70.944589 0.434813897,66.5850615 C2.12974835,60.6339485 8.25287842,57.2034087 14.1141347,58.9210964 Z"  fill="#FFFFFF" opacity="0.5"></path>
                    <path d="M142.384156,24.7309522 C149.051456,29.5402564 152.26945,38.044985 150.536828,46.2773755 C150.052178,48.5801476 149.206886,50.7346797 148.06571,52.6762577 C145.559522,45.886895 141.133149,39.864283 135.132194,35.5248258 C129.050662,31.127263 122.110908,28.9651892 115.218338,28.8707732 C118.246474,24.9148419 122.568851,22.222875 127.388867,21.3264576 C132.624553,20.3527344 138.018524,21.5773688 142.384156,24.7309522 Z"  fill="#FFFFFF" opacity="0.5"></path>
                    <g  transform="translate(114.000000, 0.000000)" fill="#FFFFFF">
                        <path d="M47.4710182,0.00125700222 C47.4710182,0.00125700222 53.9111511,16.5645363 40.3569179,36.3485414 C29.8168168,51.7347607 9.3044943,55.7192423 9.3044943,55.7192423 C9.3044943,55.7192423 5.87849338,34.7575423 16.4185946,19.371323 C30.0414726,-0.514897165 47.4710182,0.00125700222 47.4710182,0.00125700222 Z M7.6320567,39.9476533 L24.4250776,51.856022 L16.7930209,63 L0,51.0909965 L7.6320567,39.9476533 Z" ></path>
                        <path d="M47.4710182,0.00125700222 C47.4710182,0.00125700222 50.8970191,20.9623222 40.3569179,36.3485414 C29.8168168,51.7347607 9.3044943,55.7192423 9.3044943,55.7192423 C9.3044943,55.7192423 5.87849338,34.7575423 16.4185946,19.371323 C26.9586958,3.98510375 47.4710182,0.00125700222 47.4710182,0.00125700222 Z M6.90192535,41.009166 L23.7011867,52.9175346 L21.8789786,55.5706813 L5.08595765,43.6623127 L6.90192535,41.009166 Z" ></path>
                    </g>
                    <path d="M152.858678,12.9877052 C155.123943,14.7244594 155.680454,18.1524601 154.101685,20.6443876 C152.522916,23.1363152 149.406705,23.7485419 147.141407,22.0118394 C144.876109,20.2751369 144.319533,16.8471489 145.898256,14.3551853 C147.477413,11.8638164 150.593192,11.2516745 152.858678,12.9877052 Z" fill="#59B26A"></path>
                    <path d="M143.356019,25.2698648 C143.854453,25.616087 144.094968,26.2284089 143.965312,26.8210531 C143.835656,27.4136972 143.361391,27.8698243 142.763862,27.9765548 C142.166334,28.0832853 141.563343,27.8195773 141.236313,27.3085063 C140.909283,26.7974354 140.922687,26.1397586 141.27027,25.642421 C141.496963,25.3160011 141.844374,25.0932271 142.235744,25.0233206 C142.627114,24.9534141 143.030229,25.0421294 143.356019,25.2698648 L143.356019,25.2698648 Z" fill="#59B26A"></path>
                </g>
            </g>
        </g>
    </g>
</svg>`
  )
}

export const bell = () => {
  return (
    `
<svg width="92" height="108" viewBox="0 0 92 108" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <filter x="-17.9%" y="-14.3%" width="135.8%" height="128.6%" filterUnits="objectBoundingBox" id="filter-1">
            <feGaussianBlur stdDeviation="4" in="SourceGraphic"/>
        </filter>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-2">
            <stop stop-color="#EAC991" offset="0%"/>
            <stop stop-color="#EAC991" stop-opacity="0" offset="100%"/>
        </linearGradient>
        <filter x="0.0%" y="0.0%" width="100.0%" height="100.0%" filterUnits="objectBoundingBox" id="filter-3">
            <feGaussianBlur stdDeviation="0" in="SourceGraphic"/>
        </filter>
    </defs>
    <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g  transform="translate(12.000000, 12.000000)">
            <g >
                <rect  fill-opacity="0.09" fill="#000000" filter="url(#filter-1)" x="0" y="0" width="67.120097" height="84" rx="8"/>
                <rect  fill="#FFFFFF" x="1" y="1" width="65.1200968" height="82" rx="8"/>
                <rect  x="9" y="10" width="50" height="64"/>
                <rect  x="9" y="10" width="50" height="50"/>
                <rect  fill="url(#linearGradient-2)" filter="url(#filter-3)" transform="translate(38.000000, 38.000000) rotate(90.000000) translate(-38.000000, -38.000000) " x="35" y="32" width="6" height="12"/>
                <path d="M34,25 C30.134,25 27,28.134 27,32 L27,42 L41,42 L41,32 C41,28.134 37.866,25 34,25 Z" />
                <path d="M27,42 L27,32 C27,28.134 30.134,25 34,25 C37.866,25 41,28.134 41,32 L41,42 M24,42 L44,42" id="形状" stroke="#333333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M34,45 C35.3807,45 36.5,43.8807 36.5,42.5 L36.5,42 L31.5,42 L31.5,42.5 C31.5,43.8807 32.6193,45 34,45 Z"  stroke="#333333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <text  font-family="PingFangSC-Regular, PingFang SC" font-size="12" font-weight="normal" fill="#333333">
                <tspan x="10" y="70">差评提醒</tspan>
            </text>
        </g>
    </g>
</svg>

   `
  )
}

export const autoReply = () => {
  return (
    `
<svg width="100px" height="116px" viewBox="0 0 100 116" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <rect id="path-1" x="0" y="0" width="67.120097" height="84" rx="8"></rect>
        <filter x="-23.8%" y="-19.0%" width="147.7%" height="138.1%" filterUnits="objectBoundingBox" id="filter-2">
            <feGaussianBlur stdDeviation="4" in="SourceGraphic"></feGaussianBlur>
        </filter>
        <filter x="-26.8%" y="-21.4%" width="153.6%" height="142.9%" filterUnits="objectBoundingBox" id="filter-3">
            <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.116408982 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-4">
            <stop stop-color="#EAC991" offset="0%"></stop>
            <stop stop-color="#EAC991" stop-opacity="0" offset="100%"></stop>
        </linearGradient>
        <filter x="0.0%" y="0.0%" width="100.0%" height="100.0%" filterUnits="objectBoundingBox" id="filter-5">
            <feGaussianBlur stdDeviation="0" in="SourceGraphic"></feGaussianBlur>
        </filter>
    </defs>
    <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g  transform="translate(16.000000, 16.000000)">
            <g  filter="url(#filter-2)">
                <use fill="black" fill-opacity="0.09" filter="url(#filter-3)" xlink:href="#path-1"></use>
                <use fill-opacity="0.05" fill="#000000" fill-rule="evenodd" xlink:href="#path-1"></use>
            </g>
            <rect  fill="#FFFFFF" x="1" y="1" width="65.1200968" height="82" rx="8"></rect>
            <g  transform="translate(8.000000, 10.000000)">
                <rect  x="0" y="0" width="50" height="64"></rect>
                <rect  x="0" y="0" width="50" height="50"></rect>
                <text id="自动打包" font-family="PingFangSC-Regular, PingFang SC" font-size="12" font-weight="normal" fill="#333333">
                    <tspan x="1" y="60">自动打包</tspan>
                </text>
                <circle  fill="url(#linearGradient-4)" filter="url(#filter-5)" cx="16.4444444" cy="31" r="5"></circle>
                <g  transform="translate(15.000000, 17.000000)" stroke="#333333" stroke-width="2">
                    <path d="M2,4 C2,3.4477 2.447715,3 3,3 L17,3 C17.5523,3 18,3.4477 18,4 L18,12 C18,12.5523 17.5523,13 17,13 L3,13 C2.447715,13 2,12.5523 2,12 L2,4 Z"  stroke-linejoin="round"></path>
                    <line x1="6" y1="3" x2="6" y2="13"  stroke-linecap="round" stroke-linejoin="round"></line>
                    <line x1="14" y1="3" x2="14" y2="13"  stroke-linecap="round" stroke-linejoin="round"></line>
                    <line x1="12" y1="3" x2="16" y2="3"  stroke-linecap="round" stroke-linejoin="round"></line>
                    <line x1="4" y1="3" x2="8" y2="3"  stroke-linecap="round" stroke-linejoin="round"></line>
                    <line x1="4" y1="13" x2="8" y2="13"  stroke-linecap="round" stroke-linejoin="round"></line>
                    <line x1="12" y1="13" x2="16" y2="13"  stroke-linecap="round" stroke-linejoin="round"></line>
                    <line x1="0" y1="16" x2="20" y2="16"  stroke-linecap="round" stroke-linejoin="round"></line>
                    <line x1="7" y1="16" x2="7" y2="17"  stroke-linecap="round"></line>
                    <line x1="4" y1="16" x2="4" y2="17"  stroke-linecap="round"></line>
                    <line x1="1" y1="16" x2="1" y2="17"  stroke-linecap="round"></line>
                    <line x1="10" y1="16" x2="10" y2="17"  stroke-linecap="round"></line>
                    <line x1="13" y1="16" x2="13" y2="17"  stroke-linecap="round"></line>
                    <line x1="16" y1="16" x2="16" y2="17"  stroke-linecap="round"></line>
                    <line x1="19" y1="16" x2="19" y2="17"  stroke-linecap="round"></line>
                    <polyline  stroke-linecap="round" stroke-linejoin="round" points="13 3 13 0 7 0 7 3"></polyline>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const autoPackage = () => {
  return (
    `
<svg width="92" height="108" viewBox="0 0 92 108" version="1.1" xmlns="http://www.w3.org/2000/svg">
  
    <defs>
        <filter x="-17.9%" y="-14.3%" width="135.8%" height="128.6%" filterUnits="objectBoundingBox" id="filter-1">
            <feGaussianBlur stdDeviation="4" in="SourceGraphic"></feGaussianBlur>
        </filter>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-2">
            <stop stop-color="#EAC991" offset="0%"></stop>
            <stop stop-color="#EAC991" stop-opacity="0" offset="100%"></stop>
        </linearGradient>
        <filter x="0.0%" y="0.0%" width="100.0%" height="100.0%" filterUnits="objectBoundingBox" id="filter-3">
            <feGaussianBlur stdDeviation="0" in="SourceGraphic"></feGaussianBlur>
        </filter>
    </defs>
    <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="自动回评" transform="translate(12.500000, 12.000000)">
            <rect id="矩形备份-8" fill-opacity="0.09" fill="#000000" filter="url(#filter-1)" x="0" y="0" width="67.120097" height="84" rx="8"></rect>
            <rect id="矩形备份-8" fill="#FFFFFF" x="1" y="1" width="65.1200968" height="82" rx="8"></rect>
            <g id="编组-15" transform="translate(9.000000, 10.000000)">
                <rect  x="0" y="0" width="50" height="64"></rect>
                <rect  x="0" y="0" width="50" height="50"></rect>
                <text id="自动回评" font-family="PingFangSC-Regular, PingFang SC" font-size="12" font-weight="normal" fill="#333333">
                    <tspan x="1" y="60">自动回评</tspan>
                </text>
                <circle id="椭圆形备份-5" fill="url(#linearGradient-2)" filter="url(#filter-3)" cx="33.2222222" cy="19" r="5"></circle>
                <g id="沟通_communication" transform="translate(15.000000, 16.000000)" stroke="#333333" stroke-linecap="round" stroke-width="2">
                    <polygon  stroke-linejoin="round" points="14.5 16 9 16 9 12 16 12 16 8 20 8 20 16 17.5 16 16 17.5"></polygon>
                    <polygon  stroke-linejoin="round" points="0 0 16 0 16 12 6.5 12 4.5 14 2.5 12 0 12"></polygon>
                    <line x1="7.5" y1="6" x2="8" y2="6" ></line>
                    <line x1="11" y1="6" x2="11.5" y2="6" ></line>
                    <line x1="4" y1="6" x2="4.5" y2="6" ></line>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const errorPage = () => {
  return (
    `
<svg width="167" height="194" viewBox="0 0 167 194" version="1.1" xmlns="http://www.w3.org/2000/svg">
   
    <g id="出错页面" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="iPhone-11-Pro" transform="translate(-104.000000, -241.000000)">
            <g id="无数据图标" transform="translate(104.000000, 241.000000)">
                <g id="编组-2" transform="translate(21.000000, 0.000000)">
                    <path d="M89.8571429,0 C96.5634577,0 102,5.40989261 102,12.0833333 L102,12.0833333 L102,27.9204492 C102,29.2551374 100.912692,30.3371159 99.5714286,30.3371159 C98.2301656,30.3371159 97.1428571,29.2551374 97.1428571,27.9204492 L97.1428571,27.9204492 L97.1428571,12.0833333 C97.1428571,8.0792689 93.8809317,4.83333333 89.8571429,4.83333333 L89.8571429,4.83333333 L12.1428571,4.83333333 C8.11906825,4.83333333 4.85714286,8.0792689 4.85714286,12.0833333 L4.85714286,12.0833333 L4.85714286,103.916667 C4.85714286,107.920731 8.11906825,111.166667 12.1428571,111.166667 L12.1428571,111.166667 L40.3084101,111.166667 C41.6496731,111.166667 42.7369816,112.248645 42.7369816,113.583333 C42.7369816,114.918021 41.6496731,116 40.3084101,116 L40.3084101,116 L12.1428571,116 C5.43654232,116 0,110.590107 0,103.916667 L0,103.916667 L0,12.0833333 C0,5.40989261 5.43654232,0 12.1428571,0 L12.1428571,0 Z M51,72.5 C52.341263,72.5 53.4285714,73.5819785 53.4285714,74.9166667 C53.4285714,76.2513548 52.341263,77.3333333 51,77.3333333 L51,77.3333333 L17,77.3333333 C15.658737,77.3333333 14.5714286,76.2513548 14.5714286,74.9166667 C14.5714286,73.5819785 15.658737,72.5 17,72.5 L17,72.5 Z M51,48.3333333 C52.341263,48.3333333 53.4285714,49.4153119 53.4285714,50.75 C53.4285714,52.0846881 52.341263,53.1666667 51,53.1666667 L51,53.1666667 L17,53.1666667 C15.658737,53.1666667 14.5714286,52.0846881 14.5714286,50.75 C14.5714286,49.4153119 15.658737,48.3333333 17,48.3333333 L17,48.3333333 Z M80.1428571,24.1666667 C81.4841201,24.1666667 82.5714286,25.2486452 82.5714286,26.5833333 C82.5714286,27.9180215 81.4841201,29 80.1428571,29 L80.1428571,29 L17,29 C15.658737,29 14.5714286,27.9180215 14.5714286,26.5833333 C14.5714286,25.2486452 15.658737,24.1666667 17,24.1666667 L17,24.1666667 Z" id="形状结合" fill="#DDDDDD" fill-rule="nonzero"></path>
                    <path d="M122,50 C124.209139,50 126,51.790861 126,54 L126,111.090718 C126,113.299857 124.209139,115.090718 122,115.090718 L90.425,115.09 L80.1570756,122 L80.498,115.09 L63,115.090718 C60.790861,115.090718 59,113.299857 59,111.090718 L59,54 C59,51.790861 60.790861,50 63,50 L122,50 Z" id="形状结合" fill="#D4D4D4"></path>
                    <path d="M89.875,58 L95.125,58 C95.9534271,58 96.625,58.6715729 96.625,59.5 L96.625,92.9285714 C96.625,93.7569986 95.9534271,94.4285714 95.125,94.4285714 L89.875,94.4285714 C89.0465729,94.4285714 88.375,93.7569986 88.375,92.9285714 L88.375,59.5 C88.375,58.6715729 89.0465729,58 89.875,58 Z M92.5,109 C95.5375661,109 98,106.825383 98,104.142857 C98,101.460331 95.5375661,99.2857143 92.5,99.2857143 C89.4624339,99.2857143 87,101.460331 87,104.142857 C87,106.825383 89.4624339,109 92.5,109 Z" id="形状结合" fill="#FFFFFF"></path>
                    <ellipse id="椭圆形" fill="#CCCCCC" cx="63.5" cy="141.5" rx="53.5" ry="8.5"></ellipse>
                </g>
                <text  font-size="20" font-weight="normal" fill="#666666">
                    <tspan x="0" y="192">很遗憾!页面出错了</tspan>
                </text>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const scan = () => {
  return (
    `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 15V6H15" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 42H6V33" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 33V42H33" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 6H42V15" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 24H38" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    `
  )
}

