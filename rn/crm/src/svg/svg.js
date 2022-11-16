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

export const performance = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>业绩分析@1x</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="业绩分析">
            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="30" height="30"></rect>
            <g id="编组-12" transform="translate(3.000000, 3.000000)" fill-rule="nonzero" stroke-width="0.25">
                <path d="M23.1918047,6.34924106 C21.5859683,2.49874033 17.8559465,-0.00306553532 13.7255281,2.8192095e-06 C13.408167,2.8192095e-06 13.150895,0.260321534 13.150895,0.581437459 L13.150895,10.386471 C13.150895,10.7075869 13.408167,10.9679028 13.7255281,10.9679028 L23.4253356,10.9774383 C23.7426968,10.9774383 23.9999845,10.7171224 23.9999845,10.3960065 C24.0023789,9.0058095 23.7275047,7.62941622 23.1918047,6.34924106 Z M14.3001613,9.80573692 L14.3001613,1.18170766 C18.8747008,1.47056299 22.5461469,5.18637743 22.8320844,9.81457468 L14.3001613,9.80573692 Z" id="形状" stroke="#24B942" fill="#26B942"></path>
                <path d="M20.9300638,12.2392526 L11.6232422,12.2392526 L11.6232422,2.82232955 C11.6232422,2.39307707 11.2793328,2.04509759 10.8550991,2.04509759 C6.46604857,2.04271011 2.50796884,4.71636514 0.827261032,8.81883328 C-0.853446777,12.9213014 0.0743718957,17.6442619 3.17789974,20.7845051 C6.28142758,23.9247483 10.9491678,24.8635432 15.0036704,23.1629523 C19.058173,21.4623614 21.700568,17.4574568 21.6982084,13.016483 C21.6982084,12.5872305 21.3542975,12.2392526 20.9300638,12.2392526 L20.9300638,12.2392526 Z M10.8550991,22.4346497 C5.7239033,22.4346497 1.54797024,18.2102472 1.54797024,13.0174157 C1.54797024,8.08666625 5.31310038,4.02890197 10.086956,3.63220359 L10.086956,13.016483 C10.086956,13.4457355 10.4308654,13.7937134 10.8550991,13.7937134 L20.1305805,13.7937134 C19.7385202,18.6240446 15.7281988,22.4346497 10.8550991,22.4346497 Z" id="形状" stroke="#333333" fill="#333333"></path>
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

export const helps = (fill = '#000') => {
  return (`

<svg width="24" height="24" viewBox="0 0 48 48" fill="none">
<path d="M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
<path d="M24 28.6248V24.6248C27.3137 24.6248 30 21.9385 30 18.6248C30 15.3111 27.3137 12.6248 24 12.6248C20.6863 12.6248 18 15.3111 18 18.6248" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M24 37.6248C25.3807 37.6248 26.5 36.5055 26.5 35.1248C26.5 33.7441 25.3807 32.6248 24 32.6248C22.6193 32.6248 21.5 33.7441 21.5 35.1248C21.5 36.5055 22.6193 37.6248 24 37.6248Z" fill="#333"/>
</svg>

  `)
}

export const contactCustomerService = (width = 200, height = 200, fill = '#2C2C2C',) => {
  return (
    `
<svg  viewBox="0 0 1024 1024"  width="${width}" height="${height}">
<path d="M894.1 355.6h-1.7C853 177.6 687.6 51.4 498.1 54.9S148.2 190.5 115.9 369.7c-35.2 5.6-61.1 36-61.1 71.7v143.4c0.9 40.4 34.3 72.5 74.7 71.7 21.7-0.3 42.2-10 56-26.7 33.6 84.5 99.9 152 183.8 187 1.1-2 2.3-3.9 3.7-5.7 0.9-1.5 2.4-2.6 4.1-3 1.3 0 2.5 0.5 3.6 1.2a318.46 318.46 0 0 1-105.3-187.1c-5.1-44.4 24.1-85.4 67.6-95.2 64.3-11.7 128.1-24.7 192.4-35.9 37.9-5.3 70.4-29.8 85.7-64.9 6.8-15.9 11-32.8 12.5-50 0.5-3.1 2.9-5.6 5.9-6.2 3.1-0.7 6.4 0.5 8.2 3l1.7-1.1c25.4 35.9 74.7 114.4 82.7 197.2 8.2 94.8 3.7 160-71.4 226.5-1.1 1.1-1.7 2.6-1.7 4.1 0.1 2 1.1 3.8 2.8 4.8h4.8l3.2-1.8c75.6-40.4 132.8-108.2 159.9-189.5 11.4 16.1 28.5 27.1 47.8 30.8C846 783.9 716.9 871.6 557.2 884.9c-12-28.6-42.5-44.8-72.9-38.6-33.6 5.4-56.6 37-51.2 70.6 4.4 27.6 26.8 48.8 54.5 51.6 30.6 4.6 60.3-13 70.8-42.2 184.9-14.5 333.2-120.8 364.2-286.9 27.8-10.8 46.3-37.4 46.6-67.2V428.7c-0.1-19.5-8.1-38.2-22.3-51.6-14.5-13.8-33.8-21.4-53.8-21.3l1-0.2zM825.9 397c-71.1-176.9-272.1-262.7-449-191.7-86.8 34.9-155.7 103.4-191 190-2.5-2.8-5.2-5.4-8-7.9 25.3-154.6 163.8-268.6 326.8-269.2s302.3 112.6 328.7 267c-2.9 3.8-5.4 7.7-7.5 11.8z" fill="${fill}">
</path>
</svg>
    `
  )
}

export const Service = (width = 200, height = 200, fill = '#2C2C2C',) => {
  return (
    `
<svg width="18px" height="18px" viewBox="0 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>联系客服</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="联系客服" fill="#FFFFFF" fill-rule="nonzero">
            <g id="编组-28" transform="translate(2.000000, 2.000000)">
                <path d="M13.3,5.6 L12.6,5.6 C12.6,2.5072054 10.0927946,0 7,0 C3.9072054,0 1.4,2.5072054 1.4,5.6 L0.7,5.6 C0.313400675,5.6 0,5.91340068 0,6.3 L0,9.1 C0,9.48659932 0.313400675,9.8 0.7,9.8 L2.8,9.8 L2.8,5.6 C2.8,3.28040405 4.68040405,1.4 7,1.4 C9.31959595,1.4 11.2,3.28040405 11.2,5.6 L11.2,10.85 C11.2,11.8164983 10.4164983,12.6 9.45,12.6 L7.7,12.6 C7.31340068,12.6 7,12.9134007 7,13.3 C7,13.6865993 7.31340068,14 7.7,14 L9.45,14 L9.45,14 C11.189697,14 12.6,12.589697 12.6,10.85 L12.6,9.8 L13.3,9.8 C13.4856515,9.8 13.6636993,9.72625021 13.7949747,9.59497475 C13.9262502,9.46369928 14,9.28565154 14,9.1 L14,6.3 C14,5.91340068 13.6865993,5.6 13.3,5.6 Z" id="路径"></path>
                <path d="M9.8,7.7 L8.4,7.7 C8.4,8.47319865 7.77319865,9.1 7,9.1 C6.22680135,9.1 5.6,8.47319865 5.6,7.7 L4.2,7.7 C4.2,9.2463973 5.4536027,10.5 7,10.5 C8.5463973,10.5 9.8,9.2463973 9.8,7.7 L9.8,7.7 Z" id="路径"></path>
            </g>
        </g>
    </g>
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

export const autoPackage = () => {
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

export const autoReply = () => {
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

export const platformLogoEleme = (width = 60, height = 60) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 89 88" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="编组-8" transform="translate(0.800000, 0.000000)">
            <circle id="椭圆形备份" stroke="#00B9FF" stroke-width="4" cx="44" cy="44" r="42"></circle>
            <g id="饿了么" transform="translate(17.200000, 18.000000)" fill="#00B9FF" fill-rule="nonzero">
                <path d="M12.2220107,4.30853323 C18.707425,0.375868232 25.4291684,-0.86460667 32.3872408,0.587108523 C39.3453133,2.03882372 44.980852,5.83216001 49.293857,11.9626229 L50.5663981,14.142443 L50.5663981,14.2098601 C50.7105384,14.5324679 50.725162,14.8972252 50.6073012,15.2301057 C50.493536,15.5728278 50.283967,15.876689 50.0028442,16.1065282 L25.0019582,32.1203401 C24.6692204,32.3435169 24.2619802,32.430507 23.8657609,32.3630417 C23.4896483,32.294118 23.1572603,32.0787576 22.9431687,31.7652766 L21.6615381,29.8011914 C21.1017535,28.9548395 20.9068894,27.9224706 21.1202303,26.9334012 C21.3335711,25.9443318 21.9374521,25.0804575 22.7977354,24.5336675 L38.7772146,14.2098601 C39.1247666,14.0167651 39.3702545,13.6837763 39.4498434,13.2974818 C39.5180639,12.905649 39.4301,12.5029173 39.2044248,12.1738632 C39.152471,12.0279878 39.0513798,11.9042129 38.9181031,11.8232942 C35.804117,9.30565182 31.9629112,7.82961127 27.9469817,7.60747735 C23.9021192,7.37376469 20.0981305,8.38052693 16.5486501,10.6277641 C12.0947566,13.6705232 9.34061426,17.6526274 8.27713356,22.5695822 C7.20910808,27.4865371 8.09534199,32.2147241 10.9403801,36.7541431 C13.9672098,41.1092887 17.9575348,43.8104677 22.9068103,44.8666692 C27.8515411,45.9183761 32.6235699,45.0419537 37.2138071,42.2329072 C38.0754247,41.6847893 39.1252421,41.5063496 40.1224722,41.7385151 C41.1175859,41.9719551 41.9834984,42.5755684 42.5403001,43.4239429 L43.8219307,45.2531939 C44.0042636,45.5853005 44.0667783,45.9689176 43.9991775,46.3408567 C43.9303252,46.6852375 43.7423032,46.9951382 43.4674372,47.2172792 C42.8416928,47.7864375 42.1507275,48.2812003 41.4086476,48.6914668 C34.9232333,52.6241318 28.1969451,53.8646067 21.2388727,52.4128915 C14.2808002,50.9611763 8.64980629,47.1453676 4.33680124,40.9654655 C0.360110595,34.5518507 -0.880616886,27.9045232 0.610074007,21.0234831 C2.1007649,14.1379485 5.97292539,8.56929485 12.2174659,4.30403876 L12.2220107,4.30853323 Z M49.575634,25.7291977 C49.923272,25.5449871 50.3234287,25.4816709 50.7118313,25.5494187 C51.0890488,25.6213303 51.3935497,25.8190871 51.6344235,26.1516782 L53.2705477,28.6101557 C53.9295421,29.6888295 54.1431472,30.7989647 53.9068182,31.9450556 C53.6615575,33.1021328 52.9746143,34.12114 51.9889171,34.7900578 L49.4302007,36.4080686 C49.1262139,36.6339308 48.7345401,36.7100741 48.36672,36.6148144 C47.9741139,36.5158771 47.6237755,36.2954026 47.3668664,35.985588 L44.1037077,30.9967215 C43.8759487,30.6685311 43.7984152,30.2606844 43.8901026,29.8731029 C43.9812904,29.5018442 44.2078658,29.176947 44.5263731,28.9607247 L49.5710892,25.7247032 L49.575634,25.7291977 Z" id="形状"/>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const platformLogoMeiTuan = (width = 60, height = 60) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 88 88" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="配送回传率" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="编组-9">
            <circle id="椭圆形" stroke="#FFD200" stroke-width="4" cx="44" cy="44" r="42"></circle>
            <image id="位图" x="24.012987" y="17" width="41.987013" height="53" xlink:href="data:image/png;base64,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"></image>
        </g>
    </g>
</svg>
    `
  )
}

export const platformLogoJD = (width = 60, height = 60) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 88 88" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g id="配送回传率" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="编组-7">
            <circle id="椭圆形备份-2" stroke="#006638" stroke-width="4" cx="44" cy="44" r="42"></circle>
            <g id="京东到家" transform="translate(15.000000, 18.000000)">
                <path d="M55,26.9988246 C55,40.8070052 43.5825997,52 29.4970537,52 C15.4115078,52 4,40.8070052 4,26.9988246 C4,13.1906441 15.4174003,2 29.5017678,2 C43.5861352,2 55,13.1918195 55,26.9988246 Z" id="路径" fill="#006638"></path>
                <path d="M58,42.8564933 C58,45.6982097 55.5654175,48 52.5661914,48 L5.43380855,48 C2.4310387,48 0,45.697073 0,42.8564933 L0,41.1446434 C0,38.302927 2.43576375,36 5.43380855,36 L52.5661914,36 C55.5701426,36 58,38.302927 58,41.1446434 L58,42.8564933 Z" id="路径" fill="#1EA13A"></path>
                <path d="M14,41.6340323 L14,39 L4,39 L4,41.6419355 L8.24873382,41.6419355 L8.24873382,44.1529032 C8.24873382,44.6191935 8.16769837,44.8495161 8.00450197,44.9906452 C7.84130557,45.1317742 7.59257175,45.2040323 7.26055149,45.2096774 L7.26055149,46 C8.11930219,45.9729032 8.74957794,45.7877419 9.14687676,45.4467742 C9.54417558,45.1058065 9.74451322,44.5808065 9.74451322,43.8796774 L9.74451322,41.6419355 L14,41.6419355 L14,41.6340323 L14,41.6340323 Z M12.5593697,40.82 L5.44175577,40.82 L5.44175577,39.8230645 L12.5593697,39.8230645 L12.5593697,40.82 Z" id="形状" fill="#FFFFFF"></path>
                <polygon id="路径" fill="#FFFFFF" points="10.2707153 37.4311424 10.2707153 37 8.72928467 37 8.72928467 37.4311424 4 37.4311424 4 38 15 38 15 37.4311424"></polygon>
                <path d="M4,46 L4.81281317,46 C6.54795991,44.7631814 7,43 7,43 L5.43342878,43 C5.2548595,44.0819217 4.76292239,45.1114889 4,46 L4,46 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M12,43 C12,43 12.4522019,44.7631814 14.1868958,46 L15,46 C14.2367678,45.1115932 13.7449836,44.0819431 13.5671321,43 L12,43 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M17,46 L17.8117647,46 C19.5465241,44.7640249 20,43 20,43 L18.4331551,43 C18.2548256,44.0819941 17.7629589,45.1116107 17,46 L17,46 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M25,43 C25,43 25.4534759,44.7640249 27.1893048,46 L28,46 C27.2374575,45.1114216 26.745633,44.0818936 26.5668449,43 L25,43 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M20.8700512,37.6251874 L21.1688081,37 L19.631359,37 L19.3280058,37.6251874 L17,37.6251874 L17,38.4449025 L18.9269821,38.4449025 L17.3768933,41.6416792 L21.8410112,41.6416792 L21.8410112,44.1570465 C21.8410112,44.6428036 21.7548313,44.851949 21.5893659,44.9936282 C21.4239006,45.1353073 21.1653609,45.2083958 20.8275358,45.2128936 L20.8275358,46 C21.7077196,45.9730135 22.3519621,45.7889805 22.7602632,45.447901 C23.1681813,45.1105697 23.373864,44.582084 23.373864,43.8804348 L23.373864,41.6428036 L27.6254048,41.6428036 L27.6254048,40.8208396 L23.373864,40.8208396 L23.373864,39.0532234 L21.8410112,39.0532234 L21.8410112,40.8197151 L19.3383474,40.8197151 L20.4759219,38.4449025 L28,38.4449025 L28,37.6251874 L20.8700512,37.6251874 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M48.7962529,44 L48.7962529,45.1710123 C48.7962529,45.631135 48.7288056,45.8611963 48.5985948,46.0015337 C48.4683841,46.1418712 48.2660422,46.2154908 48,46.2212423 L48,47 C48.6913349,46.9746933 49.197502,46.7921779 49.5185012,46.452454 C49.8395004,46.1127301 50,45.5947086 50,44.8983896 L50,44.0034509 L48.7962529,44 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M49.522841,45.0184169 L49.522841,44.3624608 C48.4046072,45.044279 46.5636602,45.5901254 44,46 L44,45.3440439 C46.3332978,44.8275862 48.1742448,44.0913009 49.522841,43.1351881 C49.522841,43.0552508 49.4724736,42.6179467 49.4724736,42.5626959 C48.2566287,43.2758621 46.4492599,43.7938871 44.0503674,44.1167712 L44.0503674,43.4220219 C46.088489,43.012931 47.7314805,42.4251567 48.9793419,41.6586991 C48.8307219,41.5387138 48.6648548,41.4420063 48.4873815,41.3718652 C47.4659781,41.7527429 46.0361694,42.0662226 44.1979555,42.3123041 L44.1979555,41.5764107 C46.2024988,41.2496082 47.6815036,40.7860502 48.6349697,40.1857367 L45.5285912,40.1857367 L45.5285912,39.4086991 L44.1499308,39.4086991 L44.1499308,37.6947492 L48.8352678,37.6947492 L48.8352678,37 L50.4107124,37 L50.4107124,37.6947492 L55,37.6947492 L55,39.4134013 L53.6131402,39.4134013 L53.6131402,40.1904389 L50.7058886,40.1904389 C50.3740958,40.4652051 50.0102687,40.6984975 49.6224044,40.8851881 C50.5383878,41.2684169 50.9963795,41.9490596 50.9963795,42.927116 L50.9963795,44.0027429 L49.5181557,45.0148903 L49.522841,45.0184169 Z M45.6281546,38.5528997 L45.6281546,38.5528997 L45.6281546,39.3757837 L53.4655521,39.3757837 L53.4655521,38.5528997 L45.6281546,38.5528997 Z" id="形状" fill="#FFFFFF"></path>
                <path d="M54.8480786,42 L52,42 C52,42 52.0822163,42.6788711 52.1143878,42.9026189 C52.2931189,44.1345029 52.8882931,45.8265955 54.1483467,47 L55,47 C54.5996425,46.3262141 53.4620197,44.1395881 53.3529937,42.9026189 L54.8480786,42.9026189 L54.8480786,42 Z" id="路径" fill="#FFFFFF"></path>
                <polygon id="路径" fill="#FFFFFF" points="33.2125307 45 33.2027027 43.5239503 31 43.5239503 31 42.8764045 33.2027027 42.8764045 33.2125307 42 34.8341523 42 34.8427518 42.8764045 37 42.8764045 37 43.5239503 34.8427518 43.5239503 34.8525799 44.9387936"></polygon>
                <path d="M30,37.9931694 L30,37 L37,37 L37,37.9931694 L33.7407018,37.9931694 C33.2617544,39.0860656 32.152807,40.5669399 31.8150877,40.8101093 C32.7214035,40.7704918 34.1963158,40.6147541 35.075614,40.5027322 C35.0387719,40.4071038 34.7415789,39.6092896 34.5708772,39.3551913 L35.8529825,39.3551913 C36.3147368,40.1598361 36.5898246,40.8415301 36.9435088,42 L35.4980702,42 L35.3384211,41.4699454 C34.2638596,41.6311475 32.0963158,41.920765 30.21,41.920765 L30.21,40.8101093 C30.7638596,40.2404372 31.5092982,38.8306011 31.9710526,37.9931694 L30,37.9931694 Z" id="路径" fill="#FFFFFF"></path>
                <rect id="矩形" fill="#FFFFFF" fill-rule="nonzero" x="38" y="38" width="1" height="6"></rect>
                <path d="M38,45.9988702 L38,45.2010741 L38.8299251,45.2010741 C39.2367052,45.228118 39.4389264,45.095152 39.4389264,44.8033028 L39.4389264,37 L40.9982504,37 L40.9982504,44.8427419 C41.0333177,45.6405381 40.5412072,46.0236605 39.5242568,45.9988702 L38,45.9988702 Z" id="路径" fill="#FFFFFF"></path>
                <polygon id="路径" fill="#FFFFFF" points="37 45.7411765 30 46 30 45.259893 37 45"></polygon>
                <path d="M28.2640592,26.94718 L33.5459033,26.0252429 C33.612716,25.9605662 33.6163603,26.3721453 33.6941059,26.3157001 C35.3947917,25.0868427 37.8911555,22.6338317 40.4057409,22 C41.9740162,23.3405717 43.6710576,30.6396319 42.7296066,32.0625194 C38.9188556,31.7720622 37.6275492,31.3357884 34.765538,30.8654124 C34.6707855,30.8501251 34.8530018,31.3252049 34.765538,31.2899267 L29.3755788,32.2024562 C29.3282026,32.2494938 29.2796115,31.7320802 29.2225171,31.7814697 C27.7757194,33.0996985 23.5689516,36.1042255 22.2156916,35.9972149 C21.1296823,35.2257982 19.431426,27.4892883 20.1882312,26.0793362 C21.3033952,25.3549571 26.6265417,26.9648191 28.3211536,27.3317124 C28.4134766,27.3528793 28.172951,26.927189 28.2640592,26.94718 Z" id="路径" fill="#040000"></path>
                <path d="M32.7531158,31.582944 C31.9297931,31.7485977 31.938281,31.7512482 31.1149584,31.9169019 C29.7981272,32.1819478 29.6101817,31.8413638 29.3676713,30.4830034 C29.2282279,29.6971423 29.195489,29.6308808 29.0427074,28.760205 C28.914177,28.0167512 29.0596832,27.7530305 29.6999105,27.6244832 C30.7972698,27.4044951 31.2034747,27.2892001 32.219593,27.0798138 C33.0756545,26.9035583 33.366667,26.9578927 33.5267238,27.8815777 C33.6916308,28.8304421 33.7837848,29.1564486 33.953542,30.0496534 C34.1463377,31.0647792 33.7377078,31.3841596 32.7531158,31.582944 Z" id="路径" fill="#841A1F"></path>
                <path d="M32.6587114,29.6781312 C31.778534,29.7979282 31.9645652,29.799976 31.0843878,29.919773 C29.6752711,30.1102195 29.4947931,30.0160201 29.2351824,29.0340943 C29.0866351,28.4668504 29.2088048,28.8999626 29.0463746,28.2702605 C28.9075454,27.7337338 29.0630341,27.5432873 29.7502389,27.4511357 C30.9247342,27.2924303 31.18018,27.20847 32.267213,27.0579558 C33.1848742,26.9299676 33.4778039,26.9698999 33.6555054,27.6364627 C33.8318185,28.3224797 33.7721219,28.0767423 33.9525999,28.721803 C34.1539023,29.4528718 33.7124253,29.5358082 32.6587114,29.6781312 Z" id="路径" fill="#C11920"></path>
                <path d="M21.166858,27.1002415 C20.6689224,27.4429012 21.3284158,32.2983885 22.5738576,34.9163083 C22.7752021,35.3412062 25.4372888,34.0231088 25.9099057,33.7626874 C28.0463267,32.5919336 29,31.5982206 29,31.5982206 L28.926455,31.2338592 L28.685324,30.0539678 C27.8558332,30.0539678 26.2306099,30.21616 25.0032529,30.1590501 C27.0685403,29.5662488 27.8666841,29.567391 28.5514963,29.3869236 L28.3103652,28.1978946 L28.2958973,28.2664266 C27.3759824,27.9843034 21.8516702,26.6239446 21.166858,27.1002415 Z" id="路径" fill="#841A1F"></path>
                <path d="M24.1091699,27.2627139 C23.8497813,27.2252898 21.2429838,26.8737301 21.1432189,27.0483759 C20.7359435,27.7560316 21.3063638,30.4324217 21.5058936,31.3011144 C21.8286623,32.7164258 21.964812,33.4127409 23.9706728,32.7436433 C24.3989887,32.5990502 24.8149624,32.4223551 25.2147995,32.2151697 C27.0833369,31.2546178 28,30.4324217 28,30.4324217 L27.9600941,30.1897321 C27.3990633,30.1897321 25.8849847,30.1443695 24.6244262,30.0241588 C24.4917976,30.0116841 24.0903907,29.9697237 24.0833484,29.8914733 C24.0739588,29.7860054 24.1807659,29.7644582 24.3321738,29.6998166 C24.3966803,29.6752604 24.4625021,29.6540608 24.5293561,29.636309 C25.555176,29.3236362 26.6067073,29.0959999 27.6725365,28.9558709 L27.4565749,28.04862 C27.4565749,28.04862 26.2476593,27.567777 24.1091699,27.2627139 Z" id="路径" fill="#C11920"></path>
                <path d="M39.1175597,24.0721358 C40.0307377,24.869933 41.7069319,31.9573408 40.6753339,31.9921285 C38.5303423,32.0547463 35.7834836,31.7381785 33.7166249,31.2418744 L33.6421545,30.8719655 L33.4040934,29.6729505 C34.1878638,29.39233 35.7859252,28.9899526 36.9225143,28.5133616 C34.7396772,28.6571506 33.9852067,28.9308136 33.2685817,28.9922718 L33.0244165,27.7851397 L33,27.6575849 C33.6885459,27.1137377 38.3972723,23.4436385 39.1175597,24.0721358 Z" id="路径" fill="#841A1F"></path>
                <path d="M40.5153312,26.0652302 C40.6592066,27.0827722 40.7235411,27.5203152 40.873265,28.541673 C41.1072087,30.1455736 41.2452355,30.926537 39.1303847,30.9964931 C38.6770226,31.0098188 38.2233899,30.9851553 37.7735114,30.9227213 C35.6680184,30.6352656 34.5099972,30.1277666 34.5099972,30.1277666 L34.4550204,29.858118 C34.9767148,29.6431622 36.3675099,29.0135581 37.4962881,28.4030329 C37.61326,28.3394365 37.9711938,28.1410158 37.9477994,28.0570686 C37.916217,27.9425952 37.8097727,27.9616741 37.6436727,27.9514987 C37.5745355,27.9504722 37.5054026,27.9538699 37.4366325,27.9616741 C36.3664929,28.0288788 35.3036188,28.1956877 34.2596775,28.4602696 L34,27.2137807 C35.0293521,26.2979929 38.1817431,24.3964613 39.1818523,24.033962 C39.8170093,23.8024712 40.3340249,24.7843992 40.5153312,26.0652302 Z" id="路径" fill="#C11920"></path>
                <path d="M52.0351165,7.2802623 C50.187086,6.52839344 49.1267021,4.6717377 49.1231753,4.6717377 L49.1231753,4.6717377 C47.8135659,1.7067541 46.491025,0.156983607 45.2049274,0.0684590164 C44.9923515,0.0231785391 44.7756589,0 44.5583518,0 C42.5222266,0 41.3901316,1.94163934 40.8658176,3.21757377 C38.7154194,2.84982373 36.5379337,2.66503618 34.3565651,2.66518033 C26.8327767,2.66518033 20.2212477,4.82990164 16.0032239,6.6452459 C13.7003261,7.62269635 11.4764788,8.77816764 9.35172479,10.1012459 C8.78196432,9.6564141 8.18517705,9.24762361 7.56482506,8.8772459 C6.438608,8.13718033 5.49225649,7.77718033 4.67051774,7.77718033 C3.9940736,7.76428134 3.34557649,8.04782213 2.89419833,8.55383607 C1.97841222,9.60078689 2.16650693,11.296918 2.20882824,11.595541 C2.29934882,12.5268197 1.66923155,15.6086557 1.19664359,17.4971803 C0.809873848,18.9135738 0.994441781,20.170623 1.74329384,21.2376393 C2.77193677,22.7000656 4.31666457,23.4389508 6.33045354,23.4389508 C6.44801273,23.4389508 6.84653839,23.4318689 6.84653839,23.4318689 C7.45902179,23.4318689 10.8611848,22.9904262 12.2472077,20.887082 C12.3941866,20.6683709 12.5049482,20.4272215 12.5751979,20.1729836 C14.355044,21.6318689 16.6204097,22.9845246 19.3407294,24.2085246 C21.240837,25.0674151 23.1991853,25.7900124 25.2010552,26.3708852 C26.3590132,26.7462295 27.5334295,27 28.7466404,27 C28.7889617,27 28.8524437,27 28.9076965,27 C30.7416199,26.9728525 32.5708409,26.4487869 34.0450332,25.3617049 C34.5403412,25.0040321 35.0062013,24.6069492 35.4381097,24.1742951 C38.4393958,21.2872131 40.9633917,16.7382295 42.374102,13.9054426 C43.0618233,14.554623 44.1692309,15.0786885 45.9537794,15.0786885 C46.9772522,15.0675465 47.9948985,14.9223198 48.9809287,14.6466885 C52.0868425,13.6280656 53.7126862,12.3356066 53.9489801,10.6973115 C54.1923277,9.02242623 53.5669128,7.90465574 52.0351165,7.2802623 Z" id="路径" fill="#040000"></path>
                <path d="M52.4604927,7.34659521 C50.3922276,6.49821984 49.2211985,4.47074649 49.1417866,4.32455752 C47.5357698,0.67582445 46.3327389,0.0862754617 45.7507801,0.0671031368 C45.5690384,0.0233011832 45.3829151,0.000785408832 45.196082,0 C43.25938,0 42.2685091,2.37377347 41.939009,3.36234646 C39.6215139,2.92584787 37.2690188,2.70722892 34.9116488,2.70928915 C27.44456,2.70928915 20.8853744,4.87456358 16.6943227,6.69114136 C13.0117441,8.28603913 10.5120473,9.86416112 9.63733116,10.4477188 C8.9498849,9.78507528 7.69825859,9.02057882 7.50387723,8.90195007 C6.49167186,8.2309187 5.66673634,7.90618745 4.98521633,7.90618745 C4.50825669,7.8929817 4.04998432,8.09392303 3.73359002,8.45499524 C3.00584518,9.29378445 3.18363301,10.7904241 3.21444956,11.0085093 C3.33297478,12.230745 2.50329825,15.9334002 2.17261289,17.2502993 C1.83007501,18.5156727 2.00667758,19.5761419 2.61945296,20.4556723 C4.13302001,22.6197485 6.49522762,22.3729048 7.16726561,22.3729048 C7.8393036,22.3729048 10.8652524,21.8744243 12.0196881,20.112967 C12.3478007,19.6387259 12.414787,19.0283243 12.1974759,18.4929056 L12.1725856,18.4437765 C12.0458739,18.2220954 11.9326693,17.9927991 11.8336035,17.7571676 C13.7217102,19.7642703 16.4857183,21.5988222 20.0734767,23.224875 C22.0183159,24.1104493 24.0248028,24.8505706 26.076779,25.4392785 C26.5375618,25.6018744 27.0088133,25.7323915 27.4872291,25.8299146 C28.0694941,25.9522241 28.6633778,26.008889 29.2579959,25.9988707 C30.3330196,25.9988707 31.773101,25.8466904 32.5897398,25.4201062 L32.6158153,25.4093217 C37.2181496,23.3506934 41.3866815,15.1952657 42.8682467,12.0282373 C43.4359825,13.2432834 44.7196107,13.8951424 46.6065321,13.8951424 C47.5609359,13.8813434 48.5096937,13.7444329 49.4298028,13.4877305 C52.2388505,12.5602693 53.7607143,11.4051367 53.9550957,10.0534878 C54.1743673,8.53048627 53.5770002,7.80553274 52.4604927,7.34659521 Z" id="路径" fill="#DADAD9"></path>
                <path d="M2.00336292,18.5769978 C1.93570363,19.345325 2.86512856,22.0167943 6.96385689,20.2974852 C6.96385689,20.2974852 9.54203179,19.3429682 9.90406832,15.7759027 C9.90406832,15.7759027 9.88388924,14.8190289 10.7266628,16.2083814 C10.8097532,16.3450777 10.9640638,16.5619063 11.0946344,16.7516312 C13.136283,19.5798298 20.9954432,24.7165455 29.2558111,23.916401 C29.2558111,23.916401 36.1891075,24.0625246 42.4553069,10.44357 C42.6203006,10.0205186 42.8719457,9.13552814 43.0321914,9.44662999 C43.0321914,9.44662999 45.768238,15.3740629 51.3922677,11.5548164 C51.3922677,11.5548164 54.6434745,9.34057254 51.8991189,8.19279528 C50.3820922,7.55231404 49.1244207,6.4265259 48.3262338,4.99457405 C46.481628,0.87011778 45.533211,1.1281909 45.29581,1.06809168 C42.7936034,0.438817496 41.8534954,4.37826244 41.8534954,4.37826244 C24.1671206,0.876009861 9.10996196,11.4216553 9.10996196,11.4216553 C8.63515996,10.7688128 6.79411517,9.68584845 6.79411517,9.68584845 C2.56125528,6.93189008 3.20936002,11.3155979 3.20936002,11.3155979 C3.36723168,12.8475388 2.24551194,17.2135704 2.24551194,17.2135704 C2.13361677,17.6620418 2.05271209,18.1175781 2.00336292,18.5769978 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M42.0078455,10.987 C42.0082574,10.9803397 42.0082574,10.9736603 42.0078455,10.967 C42.0078455,10.988 41.9968455,11.009 41.9918455,11.033 C41.9948455,11.012 42.0028455,11 42.0078455,10.987 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M26.1582511,9.3871304 C28.6357677,8.83053796 30.7974037,8.88087328 30.9867119,9.49457694 C31.1760201,10.1082806 29.3203591,11.0588437 26.8417419,11.6135002 C24.3631247,12.1681566 22.2025894,12.1207253 22.0132811,11.5041177 C21.8239729,10.88751 23.6807345,9.94178687 26.1582511,9.3871304 Z" id="路径" fill="#1B2023"></path>
                <path d="M25,10 C25,10 27.3253012,8.92698375 30,9.00395116 C30,9.00395116 26.8831325,9.94793381 25,10 Z" id="路径" fill="#F0EFF0"></path>
                <path d="M23.5062303,10 C23.7815355,10.0034407 24.0022626,10.2288012 23.9999825,10.5041263 C23.9977023,10.7794515 23.773273,11.0011251 23.4979488,11 C23.2226246,10.9988663 23.0000214,10.7753588 23,10.5000242 C23.0008237,10.3665851 23.0546218,10.2389388 23.149559,10.1451673 C23.2444962,10.0513959 23.3727952,9.99918091 23.5062303,10 L23.5062303,10 Z" id="路径" fill="#F0EFF0"></path>
                <path d="M36.2041267,5.12243797 C36.5383286,4.85749644 37.164803,5.03685951 37.6050616,5.52219487 C38.0453202,6.00753024 38.1304122,6.6147856 37.7949771,6.87855482 C37.459542,7.14232403 36.8330676,6.96178866 36.3940422,6.47879791 C35.9550168,5.99580716 35.8699248,5.3885518 36.2041267,5.12243797 Z" id="路径" fill="#1B2023"></path>
                <path d="M14.6195414,9.00512293 C14.8871359,9.06153348 15.0507508,9.55281807 14.9857636,10.1015389 C14.9207763,10.6502597 14.64783,11.0502617 14.3802355,10.9948768 C14.112641,10.9394919 13.9482615,10.449233 14.0147779,9.89948654 C14.0812942,9.3497401 14.3511824,8.94973802 14.6195414,9.00512293 Z" id="路径" fill="#1B2023"></path>
                <path d="M40.0161223,10.2459552 C39.8439047,10.6097749 39.9465275,11.336237 39.7424615,11.7247824 C39.0217426,13.0905782 36.6944458,14.5905988 36.6696747,14.6047277 C29.7845092,18.8139692 22.1019525,18.8540011 21.9993297,18.8540011 C18.79679,18.7798243 16.6735592,18.1087005 15.3724906,17.4104962 C14.4123184,16.8971454 14.2577944,16.089442 13.9062818,16.0082007 C12.7668146,15.7432834 13.025141,17.2974649 13.025141,17.2974649 C13.3990655,16.5333256 13.7564761,16.6145669 14.0537284,16.8159041 C14.7740589,17.2927734 15.5455801,17.6877 16.353895,17.9933143 C17.6396292,18.4866492 19.8796377,18.9505488 21.9969706,19 C22.10903,19 29.829333,18.9587906 36.7416287,14.7307106 C36.8595859,14.6647757 39.5655256,13.1894807 40.0208406,11.5387516 C40.4407685,10.018715 40.9963472,11.3809786 40.9963472,11.3809786 C41.0635828,9.68668535 40.1824421,9.88566767 40.0161223,10.2459552 Z" id="路径" fill="#1B2023"></path>
                <path d="M22,11.7077049 C22,11.7077049 22.6180699,15.5313728 29.1178875,13.3019377 C29.1178875,13.3019377 33.2937148,11.3091467 31.5925397,9 L22,11.7077049 Z" id="路径" fill="#1B2023" opacity="0.1"></path>
                <path d="M55,26.9988246 C55,40.8070052 43.5825997,52 29.4970537,52 C15.4115078,52 4,40.8070052 4,26.9988246 C4,13.1906441 15.4174003,2 29.5017678,2 C43.5861352,2 55,13.1918195 55,26.9988246 Z" id="路径" fill="#006638"></path>
                <path d="M58,42.8564933 C58,45.6982097 55.5654175,48 52.5661914,48 L5.43380855,48 C2.4310387,48 0,45.697073 0,42.8564933 L0,41.1446434 C0,38.302927 2.43576375,36 5.43380855,36 L52.5661914,36 C55.5701426,36 58,38.302927 58,41.1446434 L58,42.8564933 Z" id="路径" fill="#1EA13A"></path>
                <path d="M14,41.6340323 L14,39 L4,39 L4,41.6419355 L8.24873382,41.6419355 L8.24873382,44.1529032 C8.24873382,44.6191935 8.16769837,44.8495161 8.00450197,44.9906452 C7.84130557,45.1317742 7.59257175,45.2040323 7.26055149,45.2096774 L7.26055149,46 C8.11930219,45.9729032 8.74957794,45.7877419 9.14687676,45.4467742 C9.54417558,45.1058065 9.74451322,44.5808065 9.74451322,43.8796774 L9.74451322,41.6419355 L14,41.6419355 L14,41.6340323 L14,41.6340323 Z M12.5593697,40.82 L5.44175577,40.82 L5.44175577,39.8230645 L12.5593697,39.8230645 L12.5593697,40.82 Z" id="形状" fill="#FFFFFF"></path>
                <polygon id="路径" fill="#FFFFFF" points="10.2707153 37.4311424 10.2707153 37 8.72928467 37 8.72928467 37.4311424 4 37.4311424 4 38 15 38 15 37.4311424"></polygon>
                <path d="M4,46 L4.81281317,46 C6.54795991,44.7631814 7,43 7,43 L5.43342878,43 C5.2548595,44.0819217 4.76292239,45.1114889 4,46 L4,46 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M12,43 C12,43 12.4522019,44.7631814 14.1868958,46 L15,46 C14.2367678,45.1115932 13.7449836,44.0819431 13.5671321,43 L12,43 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M17,46 L17.8117647,46 C19.5465241,44.7640249 20,43 20,43 L18.4331551,43 C18.2548256,44.0819941 17.7629589,45.1116107 17,46 L17,46 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M25,43 C25,43 25.4534759,44.7640249 27.1893048,46 L28,46 C27.2374575,45.1114216 26.745633,44.0818936 26.5668449,43 L25,43 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M20.8700512,37.6251874 L21.1688081,37 L19.631359,37 L19.3280058,37.6251874 L17,37.6251874 L17,38.4449025 L18.9269821,38.4449025 L17.3768933,41.6416792 L21.8410112,41.6416792 L21.8410112,44.1570465 C21.8410112,44.6428036 21.7548313,44.851949 21.5893659,44.9936282 C21.4239006,45.1353073 21.1653609,45.2083958 20.8275358,45.2128936 L20.8275358,46 C21.7077196,45.9730135 22.3519621,45.7889805 22.7602632,45.447901 C23.1681813,45.1105697 23.373864,44.582084 23.373864,43.8804348 L23.373864,41.6428036 L27.6254048,41.6428036 L27.6254048,40.8208396 L23.373864,40.8208396 L23.373864,39.0532234 L21.8410112,39.0532234 L21.8410112,40.8197151 L19.3383474,40.8197151 L20.4759219,38.4449025 L28,38.4449025 L28,37.6251874 L20.8700512,37.6251874 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M48.7962529,44 L48.7962529,45.1710123 C48.7962529,45.631135 48.7288056,45.8611963 48.5985948,46.0015337 C48.4683841,46.1418712 48.2660422,46.2154908 48,46.2212423 L48,47 C48.6913349,46.9746933 49.197502,46.7921779 49.5185012,46.452454 C49.8395004,46.1127301 50,45.5947086 50,44.8983896 L50,44.0034509 L48.7962529,44 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M49.522841,45.0184169 L49.522841,44.3624608 C48.4046072,45.044279 46.5636602,45.5901254 44,46 L44,45.3440439 C46.3332978,44.8275862 48.1742448,44.0913009 49.522841,43.1351881 C49.522841,43.0552508 49.4724736,42.6179467 49.4724736,42.5626959 C48.2566287,43.2758621 46.4492599,43.7938871 44.0503674,44.1167712 L44.0503674,43.4220219 C46.088489,43.012931 47.7314805,42.4251567 48.9793419,41.6586991 C48.8307219,41.5387138 48.6648548,41.4420063 48.4873815,41.3718652 C47.4659781,41.7527429 46.0361694,42.0662226 44.1979555,42.3123041 L44.1979555,41.5764107 C46.2024988,41.2496082 47.6815036,40.7860502 48.6349697,40.1857367 L45.5285912,40.1857367 L45.5285912,39.4086991 L44.1487595,39.4086991 L44.1487595,37.6947492 L48.8340965,37.6947492 L48.8340965,37 L50.4107124,37 L50.4107124,37.6947492 L55,37.6947492 L55,39.4134013 L53.6131402,39.4134013 L53.6131402,40.1904389 L50.7058886,40.1904389 C50.3740958,40.4652051 50.0102687,40.6984975 49.6224044,40.8851881 C50.5383878,41.2684169 50.9963795,41.9490596 50.9963795,42.927116 L50.9963795,44.0027429 L49.5181557,45.0148903 L49.522841,45.0184169 Z M45.6281546,38.5528997 L45.6281546,38.5528997 L45.6281546,39.3757837 L53.4655521,39.3757837 L53.4655521,38.5528997 L45.6281546,38.5528997 Z" id="形状" fill="#FFFFFF"></path>
                <path d="M54.8480786,42 L52,42 C52,42 52.0822163,42.6788711 52.1143878,42.9026189 C52.2931189,44.1345029 52.8882931,45.8265955 54.1483467,47 L55,47 C54.5996425,46.3262141 53.4620197,44.1395881 53.3529937,42.9026189 L54.8480786,42.9026189 L54.8480786,42 Z" id="路径" fill="#FFFFFF"></path>
                <polygon id="路径" fill="#FFFFFF" points="33.2125307 45 33.2027027 43.5239503 31 43.5239503 31 42.8764045 33.2027027 42.8764045 33.2125307 42 34.8341523 42 34.8427518 42.8764045 37 42.8764045 37 43.5239503 34.8427518 43.5239503 34.8525799 44.9387936"></polygon>
                <path d="M30,37.9931694 L30,37 L37,37 L37,37.9931694 L33.7407018,37.9931694 C33.2617544,39.0860656 32.152807,40.5669399 31.8150877,40.8101093 C32.7214035,40.7704918 34.1963158,40.6147541 35.075614,40.5027322 C35.0387719,40.4071038 34.7415789,39.6092896 34.5708772,39.3551913 L35.8529825,39.3551913 C36.3147368,40.1598361 36.5898246,40.8415301 36.9435088,42 L35.4980702,42 L35.3384211,41.4699454 C34.2638596,41.6311475 32.0963158,41.920765 30.21,41.920765 L30.21,40.8101093 C30.7638596,40.2404372 31.5092982,38.8306011 31.9710526,37.9931694 L30,37.9931694 Z" id="路径" fill="#FFFFFF"></path>
                <rect id="矩形" fill="#FFFFFF" fill-rule="nonzero" x="38" y="38" width="1" height="6"></rect>
                <path d="M38,45.9988702 L38,45.2010741 L38.8299251,45.2010741 C39.2367052,45.228118 39.4389264,45.095152 39.4389264,44.8033028 L39.4389264,37 L40.9982504,37 L40.9982504,44.8427419 C41.0333177,45.6405381 40.5412072,46.0236605 39.5242568,45.9988702 L38,45.9988702 Z" id="路径" fill="#FFFFFF"></path>
                <polygon id="路径" fill="#FFFFFF" points="37 45.7411765 30 46 30 45.259893 37 45"></polygon>
                <path d="M28.2640592,26.94718 L33.5459033,26.0252429 C33.612716,25.9605662 33.6163603,26.3721453 33.6941059,26.3157001 C35.3947917,25.0868427 37.8911555,22.6338317 40.4057409,22 C41.9740162,23.3405717 43.6710576,30.6396319 42.7296066,32.0625194 C38.9188556,31.7720622 37.6275492,31.3357884 34.765538,30.8654124 C34.6707855,30.8501251 34.8530018,31.3252049 34.765538,31.2899267 L29.3755788,32.2024562 C29.3282026,32.2494938 29.2796115,31.7320802 29.2225171,31.7814697 C27.7757194,33.0996985 23.5689516,36.1042255 22.2156916,35.9972149 C21.1296823,35.2257982 19.431426,27.4892883 20.1882312,26.0793362 C21.3033952,25.3549571 26.6265417,26.9648191 28.3211536,27.3317124 C28.4134766,27.3528793 28.172951,26.927189 28.2640592,26.94718 Z" id="路径" fill="#040000"></path>
                <path d="M32.7531158,31.582944 C31.9297931,31.7485977 31.938281,31.7512482 31.1149584,31.9169019 C29.7981272,32.1819478 29.6101817,31.8413638 29.3676713,30.4830034 C29.2282279,29.6971423 29.195489,29.6308808 29.0427074,28.760205 C28.914177,28.0167512 29.0596832,27.7530305 29.6999105,27.6244832 C30.7972698,27.4044951 31.2034747,27.2892001 32.219593,27.0798138 C33.0756545,26.9035583 33.366667,26.9578927 33.5267238,27.8815777 C33.6916308,28.8304421 33.7837848,29.1564486 33.953542,30.0496534 C34.1463377,31.0647792 33.7377078,31.3841596 32.7531158,31.582944 Z" id="路径" fill="#841A1F"></path>
                <path d="M32.6587114,29.6781312 C31.778534,29.7979282 31.9645652,29.799976 31.0843878,29.919773 C29.6752711,30.1102195 29.4947931,30.0160201 29.2351824,29.0340943 C29.0866351,28.4668504 29.2088048,28.8999626 29.0463746,28.2702605 C28.9075454,27.7337338 29.0630341,27.5432873 29.7502389,27.4511357 C30.9247342,27.2924303 31.18018,27.20847 32.267213,27.0579558 C33.1848742,26.9299676 33.4778039,26.9698999 33.6555054,27.6364627 C33.8318185,28.3224797 33.7721219,28.0767423 33.9525999,28.721803 C34.1539023,29.4528718 33.7124253,29.5358082 32.6587114,29.6781312 Z" id="路径" fill="#C11920"></path>
                <path d="M21.166858,27.1002415 C20.6689224,27.4429012 21.3284158,32.2983885 22.5738576,34.9163083 C22.7752021,35.3412062 25.4372888,34.0231088 25.9099057,33.7626874 C28.0463267,32.5919336 29,31.5982206 29,31.5982206 L28.926455,31.2338592 L28.685324,30.0539678 C27.8558332,30.0539678 26.2306099,30.21616 25.0032529,30.1590501 C27.0685403,29.5662488 27.8666841,29.567391 28.5514963,29.3869236 L28.3103652,28.1978946 L28.2958973,28.2664266 C27.3759824,27.9843034 21.8516702,26.6239446 21.166858,27.1002415 Z" id="路径" fill="#841A1F"></path>
                <path d="M24.1091699,27.2627139 C23.8497813,27.2252898 21.2429838,26.8737301 21.1432189,27.0483759 C20.7359435,27.7560316 21.3063638,30.4324217 21.5058936,31.3011144 C21.8286623,32.7164258 21.964812,33.4127409 23.9706728,32.7436433 C24.3989887,32.5990502 24.8149624,32.4223551 25.2147995,32.2151697 C27.0833369,31.2546178 28,30.4324217 28,30.4324217 L27.9600941,30.1897321 C27.3990633,30.1897321 25.8849847,30.1443695 24.6244262,30.0241588 C24.4917976,30.0116841 24.0903907,29.9697237 24.0833484,29.8914733 C24.0739588,29.7860054 24.1807659,29.7644582 24.3321738,29.6998166 C24.3966803,29.6752604 24.4625021,29.6540608 24.5293561,29.636309 C25.555176,29.3236362 26.6067073,29.0959999 27.6725365,28.9558709 L27.4565749,28.04862 C27.4565749,28.04862 26.2476593,27.567777 24.1091699,27.2627139 Z" id="路径" fill="#C11920"></path>
                <path d="M39.1175597,24.0721358 C40.0307377,24.869933 41.7069319,31.9573408 40.6753339,31.9921285 C38.5303423,32.0547463 35.7834836,31.7381785 33.7166249,31.2418744 L33.6421545,30.8719655 L33.4040934,29.6729505 C34.1878638,29.39233 35.7859252,28.9899526 36.9225143,28.5133616 C34.7396772,28.6571506 33.9852067,28.9308136 33.2685817,28.9922718 L33.0244165,27.7851397 L33,27.6575849 C33.6885459,27.1137377 38.3972723,23.4436385 39.1175597,24.0721358 Z" id="路径" fill="#841A1F"></path>
                <path d="M40.5153312,26.0652302 C40.6592066,27.0827722 40.7235411,27.5203152 40.873265,28.541673 C41.1072087,30.1455736 41.2452355,30.926537 39.1303847,30.9964931 C38.6770226,31.0098188 38.2233899,30.9851553 37.7735114,30.9227213 C35.6680184,30.6352656 34.5099972,30.1277666 34.5099972,30.1277666 L34.4550204,29.858118 C34.9767148,29.6431622 36.3675099,29.0135581 37.4962881,28.4030329 C37.61326,28.3394365 37.9711938,28.1410158 37.9477994,28.0570686 C37.916217,27.9425952 37.8097727,27.9616741 37.6436727,27.9514987 C37.5745355,27.9504722 37.5054026,27.9538699 37.4366325,27.9616741 C36.3664929,28.0288788 35.3036188,28.1956877 34.2596775,28.4602696 L34,27.2137807 C35.0293521,26.2979929 38.1817431,24.3964613 39.1818523,24.033962 C39.8170093,23.8024712 40.3340249,24.7843992 40.5153312,26.0652302 Z" id="路径" fill="#C11920"></path>
                <path d="M52.0351165,7.2802623 C50.187086,6.52839344 49.1267021,4.6717377 49.1231753,4.6717377 L49.1231753,4.6717377 C47.8135659,1.7067541 46.491025,0.156983607 45.2049274,0.0684590164 C44.9923515,0.0231785391 44.7756589,0 44.5583518,0 C42.5222266,0 41.3901316,1.94163934 40.8658176,3.21757377 C38.7154194,2.84982373 36.5379337,2.66503618 34.3565651,2.66518033 C26.8327767,2.66518033 20.2212477,4.82990164 16.0032239,6.6452459 C13.7003261,7.62269635 11.4764788,8.77816764 9.35172479,10.1012459 C8.78196432,9.6564141 8.18517705,9.24762361 7.56482506,8.8772459 C6.438608,8.13718033 5.49225649,7.77718033 4.67051774,7.77718033 C3.9940736,7.76428134 3.34557649,8.04782213 2.89419833,8.55383607 C1.97841222,9.60078689 2.16650693,11.296918 2.20882824,11.595541 C2.29934882,12.5268197 1.66923155,15.6086557 1.19664359,17.4971803 C0.809873848,18.9135738 0.994441781,20.170623 1.74329384,21.2376393 C2.77193677,22.7000656 4.31666457,23.4389508 6.33045354,23.4389508 C6.44801273,23.4389508 6.84653839,23.4318689 6.84653839,23.4318689 C7.45902179,23.4318689 10.8611848,22.9904262 12.2472077,20.887082 C12.3941866,20.6683709 12.5049482,20.4272215 12.5751979,20.1729836 C14.355044,21.6318689 16.6204097,22.9845246 19.3407294,24.2085246 C21.240837,25.0674151 23.1991853,25.7900124 25.2010552,26.3708852 C26.3590132,26.7462295 27.5334295,27 28.7466404,27 C28.7889617,27 28.8524437,27 28.9076965,27 C30.7416199,26.9728525 32.5708409,26.4487869 34.0450332,25.3617049 C34.5403412,25.0040321 35.0062013,24.6069492 35.4381097,24.1742951 C38.4393958,21.2872131 40.9633917,16.7382295 42.374102,13.9054426 C43.0618233,14.554623 44.1692309,15.0786885 45.9537794,15.0786885 C46.9772522,15.0675465 47.9948985,14.9223198 48.9809287,14.6466885 C52.0868425,13.6280656 53.7126862,12.3356066 53.9489801,10.6973115 C54.1923277,9.02242623 53.5669128,7.90465574 52.0351165,7.2802623 Z" id="路径" fill="#040000"></path>
                <path d="M52.4604927,7.34659521 C50.3922276,6.49821984 49.2211985,4.47074649 49.1417866,4.32455752 C47.5357698,0.67582445 46.3327389,0.0862754617 45.7507801,0.0671031368 C45.5690384,0.0233011832 45.3829151,0.000785408832 45.196082,0 C43.25938,0 42.2685091,2.37377347 41.939009,3.36234646 C39.6215509,2.92544593 37.2690555,2.70642581 34.9116488,2.70809088 C27.44456,2.70809088 20.8853744,4.87456358 16.6943227,6.69114136 C13.0117441,8.28603913 10.5120473,9.86416112 9.63733116,10.4477188 C8.9498849,9.78507528 7.69825859,9.02057882 7.50387723,8.90195007 C6.49167186,8.2309187 5.66673634,7.90618745 4.98521633,7.90618745 C4.50825669,7.8929817 4.04998432,8.09392303 3.73359002,8.45499524 C3.00584518,9.29378445 3.18363301,10.7904241 3.21444956,11.0085093 C3.33297478,12.230745 2.50329825,15.9334002 2.17261289,17.2502993 C1.83007501,18.5156727 2.00667758,19.5761419 2.61945296,20.4556723 C4.13302001,22.6197485 6.49522762,22.3729048 7.16726561,22.3729048 C7.8393036,22.3729048 10.8652524,21.8744243 12.0196881,20.112967 C12.3478007,19.6387259 12.414787,19.0283243 12.1974759,18.4929056 L12.1725856,18.4437765 C12.0458739,18.2220954 11.9326693,17.9927991 11.8336035,17.7571676 C13.7217102,19.7642703 16.4857183,21.5988222 20.0734767,23.224875 C22.0183159,24.1104493 24.0248028,24.8505706 26.076779,25.4392785 C26.5375618,25.6018744 27.0088133,25.7323915 27.4872291,25.8299146 C28.0694941,25.9522241 28.6633778,26.008889 29.2579959,25.9988707 C30.3330196,25.9988707 31.773101,25.8466904 32.5897398,25.4201062 L32.6158153,25.4093217 C37.2181496,23.3506934 41.3866815,15.1952657 42.8682467,12.0282373 C43.4359825,13.2432834 44.7196107,13.8951424 46.6065321,13.8951424 C47.5609359,13.8813434 48.5096937,13.7444329 49.4298028,13.4877305 C52.2388505,12.5602693 53.7607143,11.4051367 53.9550957,10.0534878 C54.1743673,8.53048627 53.5770002,7.80553274 52.4604927,7.34659521 Z" id="路径" fill="#DADAD9"></path>
                <path d="M2.00336292,18.5769978 C1.93570363,19.345325 2.86512856,22.0167943 6.96385689,20.2974852 C6.96385689,20.2974852 9.54203179,19.3429682 9.90406832,15.7759027 C9.90406832,15.7759027 9.88388924,14.8190289 10.7266628,16.2083814 C10.8097532,16.3450777 10.9640638,16.5619063 11.0946344,16.7516312 C13.136283,19.5798298 20.9954432,24.7165455 29.2558111,23.916401 C29.2558111,23.916401 36.1891075,24.0625246 42.4553069,10.44357 C42.6203006,10.0205186 42.8719457,9.13552814 43.0321914,9.44662999 C43.0321914,9.44662999 45.768238,15.3740629 51.3922677,11.5548164 C51.3922677,11.5548164 54.6434745,9.34057254 51.8991189,8.19279528 C50.3820922,7.55231404 49.1244207,6.4265259 48.3262338,4.99457405 C46.481628,0.87011778 45.533211,1.1281909 45.29581,1.06809168 C42.7936034,0.438817496 41.8534954,4.37826244 41.8534954,4.37826244 C24.1671206,0.876009861 9.10996196,11.4216553 9.10996196,11.4216553 C8.63515996,10.7688128 6.79411517,9.68584845 6.79411517,9.68584845 C2.56125528,6.93189008 3.20936002,11.3155979 3.20936002,11.3155979 C3.36723168,12.8475388 2.24551194,17.2135704 2.24551194,17.2135704 C2.13361677,17.6620418 2.05271209,18.1175781 2.00336292,18.5769978 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M42.0078455,10.987 C42.0082574,10.9803397 42.0082574,10.9736603 42.0078455,10.967 C42.0078455,10.988 41.9968455,11.008 41.9918455,11.033 C41.9948455,11.012 42.0028455,11 42.0078455,10.987 Z" id="路径" fill="#FFFFFF"></path>
                <path d="M26.1582511,9.3871304 C28.6357677,8.83053796 30.7974037,8.88087328 30.9867119,9.49457694 C31.1760201,10.1082806 29.3203591,11.0588437 26.8417419,11.6135002 C24.3631247,12.1681566 22.2025894,12.1207253 22.0132811,11.5041177 C21.8239729,10.88751 23.6807345,9.94178687 26.1582511,9.3871304 Z" id="路径" fill="#1B2023"></path>
                <path d="M25,10 C25,10 27.3253012,8.92698375 30,9.00395116 C30,9.00395116 26.8831325,9.94793381 25,10 Z" id="路径" fill="#F0EFF0"></path>
                <path d="M23.5062303,10 C23.7815355,10.0034407 24.0022626,10.2288012 23.9999825,10.5041263 C23.9977023,10.7794515 23.773273,11.0011251 23.4979488,11 C23.2226246,10.9988663 23.0000214,10.7753588 23,10.5000242 C23.0008237,10.3665851 23.0546218,10.2389388 23.149559,10.1451673 C23.2444962,10.0513959 23.3727952,9.99918091 23.5062303,10 L23.5062303,10 Z" id="路径" fill="#F0EFF0"></path>
                <path d="M36.2041267,5.12243797 C36.5383286,4.85749644 37.164803,5.03685951 37.6050616,5.52219487 C38.0453202,6.00753024 38.1304122,6.6147856 37.7949771,6.87855482 C37.459542,7.14232403 36.8330676,6.96178866 36.3940422,6.47879791 C35.9550168,5.99580716 35.8699248,5.3885518 36.2041267,5.12243797 Z" id="路径" fill="#1B2023"></path>
                <path d="M14.6195414,9.00512293 C14.8871359,9.06153348 15.0507508,9.55281807 14.9857636,10.1015389 C14.9207763,10.6502597 14.64783,11.0502617 14.3802355,10.9948768 C14.112641,10.9394919 13.9482615,10.449233 14.0147779,9.89948654 C14.0812942,9.3497401 14.3511824,8.94973802 14.6195414,9.00512293 Z" id="路径" fill="#1B2023"></path>
                <path d="M40.0150623,10.2459552 C39.8440235,10.6097749 39.9466468,11.336237 39.7425798,11.7247824 C39.0218577,13.0905782 36.6945506,14.5905988 36.6697795,14.6047277 C29.7845835,18.8139692 22.1019928,18.8540011 21.9993695,18.8540011 C18.7968156,18.7798243 16.6735755,18.1087005 15.3725011,17.4104962 C14.4123247,16.8971454 14.2578,16.089442 13.9062858,16.0082007 C12.7668136,15.7432834 13.0251411,17.2974649 13.0251411,17.2974649 C13.3990673,16.5333256 13.7564794,16.6145669 14.053733,16.8159041 C14.7740667,17.2927734 15.5455914,17.6877 16.3539099,17.9933143 C17.6396497,18.4866492 19.8796681,18.9505488 21.9970104,19 C22.1090703,19 29.8294074,18.9587906 36.7417337,14.7307106 C36.8596915,14.6647757 39.5656431,13.1894807 40.0209602,11.5387516 C40.4408899,10.018715 40.9964711,11.3809786 40.9964711,11.3809786 C41.0625274,9.68668535 40.1813828,9.88566767 40.0150623,10.2459552 Z" id="路径" fill="#1B2023"></path>
                <path d="M22,11.7077049 C22,11.7077049 22.6180699,15.5313728 29.1178875,13.3019377 C29.1178875,13.3019377 33.2937148,11.3091467 31.5925397,9 L22,11.7077049 Z" id="路径" fill="#1B2023" opacity="0.1"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const platformLogoWSB = (width = 60, height = 60) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 88 88" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <rect id="path-1" x="0" y="0" width="50" height="50"></rect>
        <rect id="path-3" x="0" y="-3.2895497e-15" width="39.1157407" height="21.4722222"></rect>
        <rect id="path-5" x="0" y="-3.2895497e-15" width="39.1157407" height="21.4722222"></rect>
        <rect id="path-7" x="0" y="0" width="50" height="50"></rect>
    </defs>
    <g id="配送回传率" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="编组-6备份">
            <circle id="椭圆形备份-3" stroke="#59B26A" stroke-width="4" cx="44" cy="44" r="42"></circle>
            <g id="logo-01" transform="translate(19.000000, 19.000000)">
                <mask id="mask-2" fill="white">
                    <use xlink:href="#path-1"></use>
                </mask>
                <g id="矩形"></g>
                <g id="编组" mask="url(#mask-2)">
                    <rect id="矩形" fill="#59B26A" fill-rule="nonzero" x="0.037037037" y="0" width="49.962963" height="49.962963"></rect>
                    <g id="Clipped" transform="translate(5.490741, 4.879630)">
                        <mask id="mask-4" fill="white">
                            <use xlink:href="#path-3"></use>
                        </mask>
                        <g id="矩形"></g>
                        <g mask="url(#mask-4)">
                            <mask id="mask-6" fill="white">
                                <use xlink:href="#path-5"></use>
                            </mask>
                            <g id="矩形"></g>
                            <image id="位图" mask="url(#mask-6)" x="0" y="-3.2895497e-15" width="39.5833333" height="21.7268519" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcIAAAD4CAYAAAB/juY6AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAABwqADAAQAAAABAAAA+AAAAADnBOyrAABAAElEQVR4Ae29d/Rl1XXnKUROAgQiGiiKJLLIGYqMiAqWx7ZWW+rgVluSu/uPmV5r1syaWdN/dPe4W7a7RyhZthAKLVsi51hFFRQ5CxFEKDISWeQ8n09xClX8/V6695793t5rfeu+er97z9nnu8/Z+6R73kc+kpIMJAPJQDKQDEwwAytNcNmz6IEZeP/999dC/WPB18BRIOsyJHQg75Pn5eA0ryuttNLrHeiQWSYDQzGwylBP58PJQAcMEAStt6eAvwAHgwyCkNCRyP2RYFWwOrY5m2D4Tke6ZLbJwEAMZCAciLZ8qCsGcLRrkPfnwNfBvmBlkNItA/qRQ8BqYJUSDN/oVqXMPRnonYEMhL1zlXd2zAAOdl1UOBH8JTigY3Uy+yUZcETo6Pyj4D1sdREjw5eXvCX/lwzUyUAGwjrtklotxQCOdR2+OgEYBPdf6s/533oYsIPiuiEmWxgMX6lHtdQkGVg+AxkIl89LflsRAzhU66kjQadDdbS5JggJlYq20UbvgpWw3Zm5ZlippVKtDxnIQPghFfmhRgZwpK47nQoWBUGn3lLqZkAbHQgMik6TnkswfKtulVO7SWYgA+EkW7/ysuNA3RhzDPAVCR1rboyBhCCib9FmjgzfwJa+WvFGEN1TzQljIAPhhBk8SnFxnKuj6+HANUF3JGYQhIRgos20naPBt7DpHILhm8HKkOpOAAMZCCfAyNGKiMN0as0diL4neDTINUFICCoGQ234Gni7BMP3gpYl1R5TBjIQjqlhgxfL9wO/Ajw5JoNgcGMWG2pLR4PuIr0RpCQD1TCQGw+qMUUqIgOMGHbl4saY48GaIGU8GNCW2vTrxcbjUaosxVgwkIFwLMw4HoXAQe5ISb4KPgM+Nh6lylIsxoA2/Sz4arH1Yn/Kj8lAdwxkIOyO+8x5MQZwjNvw338F/gyss9if8uN4MaBttfG/KjYfr9JlaUIykIEwpNnGS2kc4oaU6EvAQLj2eJUuS7McBrTxwk4Ptv/4cv6eXyUDrTKQgbBVujOzpRnAEfquoEHwX4D1l/57/n9sGdDW/xJ8udSBsS1oFqx+BjIQ1m+jsdUQB+gGii+APwdbjm1Bs2ArYkCba/svlLqwovvy+2SgUQYyEDZKbya+IgZwfB6ddgT4d+CTK7ovvx97BrS9deCIUifGvsBZwPoYyEBYn03GXiMcnvXuIODRaZ8a+wJnAadjwDpgXTio1I3p7s+/JwMjZSBfqB8pnZlYjwzsw32uDzki9OSRlMlmwDpgXXgeeAJNvnAPCSntMZCBsD2uMycYoMe/BZcvAn9bMF+Yh4SUhQxYF6wTz1NHnuBM0ieSl2SgLQZyarQtpjMfg+B60PCn4BSQ2+azTizNgHXCuvGnpa4s/ff8fzLQCAMZCBuhNRNdmgEc26p8dxxwl+AMkJIMLI+BGXxpHTmu1Jnl3ZPfJQMjZSAD4UjpzMSmYMCf43F34PZT3JN/SgZkwDpiXbHOpCQDjTOQgbBxijMDevZ7woInifhDrSnJQC8MWFc8hm2vXm7Oe5KBYRiocrMMlX8tCvVu/ojnMKat41lsuTGa/AnwlwdWqkOr1CIAA9aVT4MnqUOP4wt+G0DnVHEKBrCj7w6vgi3dGVyVVBMIIWlVmNkI7ABmglf57kauj0Jc/pAnREQT7OdOwM+DE0FujolmwO713aDUnYeoS6fjB17vXqXUoF8GsJ0zj1uB/cFa/P8hrveDZ7Hp21w7lyoCIcS4m/BQ8DngL5N7DqG9hgvBfwWPgJR4DOyNyv7SQJ4cE892tWjsT3NZh+4E19aiVOrRFwMGwf8AfD3GzvGLQFuehe+fRzB8ic+dSqeBEBKcNjsKHAFcC9Bhrg0Wib9ddjn3OTXy7qIv81o/A9hsW7T810C75lp0/SarVUPrjnXoK9Spp/ADjiZSgjCAzTwswZODPgM2K2rr932feHdwK/fM5noltu1s+ruTQEjBt6HgVm6P2ToMeNLI8kTijgF3gWwAy2Oowu+wrz+r5PtgJwHXBVKSgWEYsA5Zl26jbp2Bw3xumMTy2VYZcDR4NNh0qVwd8DhjJNxMtw+2nc/1Vuz7MNdWpbVASCHNa3OwE5CYk4HTHlOJC+beOw9kIJyKqUr+hp212Szwx8A1npRkYBQMWJesU49Sx87CWb4/ikQzjcYZ2JccnPXTL6xIHAgJ9xKcj32v4HoPeBI7v8O1cWk8EFIoh8brAhdK/xAcARzprQV6ke25aT/JyZ5gL3R1fs8OaOA0iD29lGRglAxYp6xbd4N7R5lwpjV6BvDZG5Kqfl+f0Is4MPKnuVwSc7r0F6RxA9eX8f2NLo01GggLEfYGjgX2DLYBBsV+xDUCp1DdTHNOPw/mve0ygL1XJ8c/Ap8GdoBSkoFRMmCdcsPFA9S1/4JzfHOUiWdaI2fAAxH03f3sEXCAtC1wHXE/cBO4DHu7htjYlHgjgRClnRc+AEjCgcA54FXBoLILDx5NupdCxuuDJpLPNccAtlmN1LW3a4P2BFOSgSYY+DiJul44lzp3Lf7grSYyyTSHYwDbuDvUZa2dB0zJAZObaVxK2w34E13zuV6PzR/lOlIZWSBESaP+1kDFZwF7bgawUYikuLlmN/K5BSIaHSaPQuEJTMNdYF8CvU6DTCBFWeQRMWAds64tAA+DlIoYwEc7cjd4OZX9sSFVcwDlyFAYWC8i/TlcXUN8hFjwHtehZehAiFIqamEXzd8fx2fneYcZAfL4MuJw+VTwIHhumb/mF50xQB2wHjkN4pTosBW/s3JkxmEYsI5Z166k7j2GM2xlQ0UYdrpXdH1U0Ffrs0cpDqzsBH0eXArOwf63cP0ddWCoF/OHCoQoYYFngZOBU6GOCnw5vgnZiEQNsr8AGQibYHjwNO0E/QlwXj8lGWiDAeuade5+cEMbGWYePTPg0pi+Wp89anGANRP8KTgcXA/caTqHYPginweSgQIhmRrwDgNuYNEJ7gFWB02KU6/bgUPI32PXMhg2yXaPaWOLdbh1FrAupCQDbTJgnTuCOvgr/MHLbWaceS2fAWyxIX9xdkhfrc9uShxwCUedu4JjyXse17nUhSe49iV9BUIyMhKbqQU9BnwKtCnuKDoV3AyuazPjzGuFDLgb2LpgQExJBtpkwDpn3bsRXNVmxpnXChnYnr/oo/XVbYgDsEVriAfyeU/i1DVcf0lAfKhXBaYNhCS6Kom5U2s3cBI4ERiFp3pBkj83IuriFOyn0OtmCjrUvHAjGk5QothgDYrrpijfFUpJBrpgwLp3AnVxPv7gjS4UyDw/YKDECt8Q0Cb66rbFgdkewPcQL0SfC7jeBZ6fLlZMGQhJyKGnU6AmfDDYDKwLupS1yVydXBe4tUtFJjlv6sbKlN9pcTsmORqc5MrQbdn1B9bBvamTbq1/t1t1Jjr3XSm909Vd+gMHaNuBfwHcUHUtOJu64ZTpS3xeriw3EPLQJtx9FHAx0tcWdgJWuFpkFoq4SJqBsDuLuFHqZLBzdypkzsnAQgasg6eA+8CzC7/Jf7pgYOGabRcZLydPB2zC/Sy7AQ/3vpqrL+b/husSskQg5EZPfnFo64vRs4A9/hplU5Ty2LXNKNRTNSo4AToZCB2ZO22ekgx0ycAGZG5d/DuQgbADS+iLydYpUX1zTeIAbp8C49le6OqL+bcROz58B3UVvnQoaUVyftX1npPAjqB2Ud/j0P8nFCjXCtu31mpkWVulb5+FzLEWBpzF6mJdqpbyd6YHPljejwP65JrFQCiMcReg90Vc7wDPOyJcC/hOhnOqvqxY0xQo6qxQDNYG7kvA0yu8K/+QDCQDyUAy0CQDG5K4vjjCAEoe1PMPgMt/PwDf+Sj/WIjPA6dEowRBVF14qLM6O9R1dJLSPgPvtZ9l5pgMLJeBrIvLpaXZL4vv1Q87GnQDXRQx1qnz58CaBkKnRqMGks3R3Q0bOUUHCSnJQDKQDLTMgL5XH+wIK6IsnE43ED4PrgQRF5md1j0auKs1JRlIBpKBZKBdBvS9x4A12812JLkZ84x9bxgIXwEXgttBRHGnqz/RkedcRrRe6pwMJAMhGSg+1zcM9MERxZhn7Hvro+y4fJ8PtwHfyzMoRhPnpY8FHrOTkgwkA8lAMtAOA/pcfW+ktcFFzBjrbgC+RrHwNwQ/woe3+GIuuAVElN1R+kB6KE6VpiQDyUAykAw0yEDxtZ7tqe+NKMY6T5sx9i1xOrijwivAO/4hmBgA7Z14zlxKMpAMJAPJQLMM6Gs9cD/i4MMYZ6y7FSwU1wgXCpHRhUOnR+8BTpdGk91Q+KQcFUYzW+qbDCQDkRgoPvZEdNbnRhNjmzHOc2k/3CD6YSAspfkV1/PAy+X/kS4bo6xn3W0VSenguvrqTUoyUAMDWRfbs4I+9jDgaT7RxNh2ATAYfihLB8Lf8hdPannywzvifLAhbAeOoseyfhy1w2oq33mkVVjzjZ3i1sUMhg2btfjWI8lGXxuRb2PbxeA34ENZIhAyVHTu9F5wDYg4KvQA6M+ALUFKswy8QfILms0iU08GemZgAXdaJ1OaZUDf+lkQ8bB9Y5qx7Z4S6/j4gSwRCMt3v+N6Dvh1+X+ky+oouxfYnZ7LapEUD6jrc+j8M7DEFEPAcqTK8RmwDloXrZMpDTFQfKq7RPWx+tpoYkwzthnjlpBlAiGRctGrFLdzZ8RNMx9D7+OAJx6kNMeAlenHBY82l02mnAxMyYB1b1E9XMbBTflk/rFfBvSp+lZ9bDQxlhnT5pUYt4T+ywRC/8qNDiFngzv9fzBZBX19yXOfYHqHUpc68j7Q8fwA/BBkbzyUBcdCWeucde8H1kXr5FiUqt5C6FP1rfrYaGIsm1181jK6LzcQlrvmcJ27zBMxvtgENf3h3j+IoW5cLalYT6G9zugnwNMaUpKBNhiwrlnnfljqYBt5TmwexZf6rra+NaLMQ+k5K1J8hYGQyvU4D3kEzRMrerjy7z314MjKdRwL9agrD1KQ74DzwZtjUagsRM0MWMcuAN8pda9mXcdFN33pAUEL8yR631Bi2nKLsMJAWO52TvVSsPAYmuWmUO+Xu6DaEfRk1q1XxfHRjErmhoW/AXPAuyAlGWiCAevWHPC3pc41kUemuRgDxYcewVe7LvZ1lI/GrkuAJ6etUKYLhO6ysef1/ApTqPcPls1jgA7GkBF3ONXL7Io1u4U//S24esW35F+SgaEYsG5Zx24aKpV8uCcGiu88iJv1pdPFi57SbPmmF8jPX5iY8i2IKQtGj8toehew0r0Oosm2KOw7L+tFUzyivtQXfyX8KvB3IB1VRCPWrbN1yrp1ValrdWs7Htq5Q1Qfqi+NJsasG8GdJZatUP8pA2F5yjfwzwJeo4lGPARsT8+ml7JGK191+pYKdzGKfRc8UJ2CqVBUBqxL1qmLp3NqUQtYm97FZ+6AXocCfWk06Tl2TRscqHS+SnEluBvY448mW6Lw0eAT0RSPqi915iV0d+OMG2gei1qO1LsaBqxDCzdjlbpVjWJjrog+U9+pD40mxirPzr6yxLAp9Z82EJann+bqlNfDU6ZW5x/XQa2TwC51qjeeWlH5PLf2p8DZhGfGs5RZqhYY8BcCzgb/s9SpFrLMLAoDO3M9EehDo8kCFDZmGbumlZ4CIRXwbVK6CNw6bYr13bASKu0G9mGonztIW7QP9cZ3DO3Ju1j9WotZZ1bjwYB1ZtFrEk+OR5FilAJfafDbB+g79aHRxI17F5XYNa3uPQXCksp9XK8H7sKJJu4aPQzsHk3x6PpSEe+lDN8DdqTejV6e1L81Bqwr1pnvUod8NSelXQb0lfrMNdrNdiS5GaOMVfqenqTnQEhl9Pii68A1PaVc3037otKs3DTTvmGoO9ab08Bc8F77GmSOwRiwjlhXTqPu6NBSWmSg+MhZZLlfi9mOMitjlD+82/ORez0HwqKlU6O+YB/xVYqN0Xt/sB1IaZ8BK+dfgYjT6+2zNdk5WkesK1E73dGtp488AOgzo4mx6TLg1GjP0lcgJMK+Scq+y3MbeKfnXOq50fnu4+jxrFWPSpOhCXXH+nIV+G8g4mHuk2Go7kvpe8t/DXxXMKKP6Z7BITQovvE4ktBXRhPri7HpphKreta/r0BYUn2A67nALfLRZHMUPgFE7OlE43oZfamcHtBwHvgH8OAyN+QXk86AdcK6cW6pK5PORxfl95UJfaS+MpoYk4xN9/ereN+BkAr6PJlcDqy0Pc/B9qtYQ/evRrr2dPam5+PnlJYZoP44dfFP4AyQr1W0zH/F2VkXrBP/SB15rWI9x1a14hMX7RSN5h+NRcaky6k/fW/o7DsQllrgqNAz/wyK0WRDFP4siHhkUDSul6svFfUp/vBT8EMQcWZhueXKLwdmwDpgXfhpqRsDJ5QPDsWAPlHfqI+MJsYiY9JAM00DBUIq68tkeD74JYgmq6Pw0WCXaIqPk77UITtTp4OzgT/wmzKZDGh768DppU5MJgt1lFqfeBTQR0YTY9H51KGBfMlAgbAwdCvXm0C0aYyV0HkT4K9SbMU1pSMGqLR3k/W3gT05N2KlTBYDrhlr+2+XujBZpa+otMUXHoRKmwJ9ZCQxBhmLjEkDycCBkIr7KjnOA3cNlHP3DzkqPKR7NSZbA+rRjTDwXXDdZDMxkaXX5t8rdWAiCaio0Aejiz4xohiD5pWYNJD+AwfCkpu/YH8FeHeg3Lt9aFeyP4CeUMRz9LplbvS5X0SSfw+idqpGz8j4p6itvw8uHP+i1l3C4gN9bzDiKxPvobcxyFg0sAwVCInA/szFteCBgTXo9sG9yP5QKsLK3aox2blTj9zxdQ7472ABSBlvBhZQPG19TrH9eJe24tIV33coKu5dsZpTqWbsmV9i0VT3Tfm3oQJhSdme3SUg2lqh6jsqPAms6X9SumOAivwKuZ8Jvgme6E6TzLlhBrStNj6z2Lzh7DL5aRjQ9+kD9YXRxJhzMRh6JmkUgdBRodMbT4Josh4K7w92zFFh96bDMb6IFmeAHwLrVcp4MfA0xdG2ZxRbj1fpgpWm+LwdUXtfoC+MJnaqjD3Wq6Fk6EBIhfYnmu4EbnpwF1g02RKFPUlhg2iKj6O+1KdnKJebZ3zp/tVxLOOElklb/hz4axLaOKV7BvR5+r6tu1elbw2MNe4UvbPEoL4TWPyBoQNhScyXGV3juW/xxIN8/gR6ngxmBtF37NWkYj9KIU8HZwEXw1NiM6ANF70rqG1T6mBgG9TQ921Uhzp9aWGsORcYe4aWkQTCEpGvQpvbh9ao/QR8Z2YnsB9TBeu3n33muAIG7uB7d5K6/vzOCu7Jr+tnQNtpQ22pTVMqYKD4uv1QRd83kjjQcrGMNR7M7ozk0DIyAlDoObTxvcKIO0jXRu/jgfPlKRUwQH16FzX8LbpvAafdc2QICcFEm2k7bXhdsWmwIoytuvq6TwN9XzR5EIV9b/DZUSk+skBYFLqa65xRKddiOo4KfY/GUeEqLeabWU3BABX9Tf7sTMP3wNA7w6bIKv/UDAPaTNvZc9eWKRUwUHyco0F9nr4vmsxG4bmjVHrUgfDXKHctGFmkHmVhp0lrQ/5+INh+mvvyzy0ygAN9nez+EfwAWL9SYjCgrbSZvyahDVPqYUAfp6/T50UTY4sxZqS+YKSBkAr/PgreAq4EEXeQWjmOosc0Ul5IM2UIBqhXb/D4T8AZYCSL40Ook49Oz4A2+hH4SbHd9E/kHa0wUHzbUWSmr4smxhRniG6lXo10qaQJh/8Qip4PBjoFnOe6lC3J/HCwcZdKZN7LMkDFtyf4Y6CDzdcqlqWolm+0jTb6cbFZLXqlHh8w4C55fZy+LpoYU4wtxpiRysgDIZXfhnAzcIfY2yPVtvnEViaL3YDHrq3afHaZQz8MULcWcL8bL84Er4GUuhjQJtrmW9jq4bpUS22KTzsUJnYF+rpIYiwxptxM3fIUqpHKyANh0c43/X2vMOJpM/aUTgWbg5TKGKAR3I9K3wCXgmgdrcrYHKk6Tltpk28UG4008UxsJAzo0/RtEUeDxhJjylNg5NJUIHQIexG4b+QaN5/gWmRxCPD9mpQKGcDRepLRfweXVajepKp0uTYptplUDmovtz7NEWHEVyaMJcaURpbcGgmENAY3zTwCrgERR4WbobebZiL2nFB9IsS69T3gNaVbBtzF932QtujWDivMvfiyo7hB3xZNjCHWsUdKbBm5/o0EwqKlu3qM4LeMXOvmE3R90DP49mg+q8xhEAZoEO/y3GxgMLx/kDTymZEwIPd/B3xXUJuk1MmAvkyfFnHvw63obSwZ6U5R0vtQGguEJXLfRk6eDuL290jiS6Y7g33pSa0TSfFJ0pU69jLlvQQ4Gnl0kspeSVnlXO4vwhaNTFlVUs7QahQfti+F0KdFe4H+TXS+DvjKhDONjUhjgVBtUdwIbiB0yqSxaE7aTclhJOycekqlDFDHnkG1M8DPgJu0UtphQK7l3J9U0gYp9TLgngd9WTQxZhg7ri+xpDH9Gw2ERWunRh3WRtzhtzd6H0mPKuJ0QqF//C80kt9Qyu8Ct+7nyKR5k8uxXPuTSnKfUikD+K5VUO1IoC+LJsaMVpbXGg+ENJSXKMwN4F4QbQ1hXXS2Au1ChWqcK/JJGZAB6tlDPOo03XkgYqdrwJK3/tg7hePvF85bVyAz7I2B4rN8Z1Afpi+LJMYKY4ajQWNIo9KWc9dJ6aAi9tZ3QG/fvVkLpFTMAA3Gn2Y5DVwFnFZJGS0Dciq3vjAv1yl1M6DP0ndF/FWdl9HbmPEQaFzaCoROn5wPfKUimmyOwseCLaIpPqH63ki5/xu4CTS2uD6B3MqlnMqtMzwp9TOgz9J36cOiyQIUvgC0MvXeSiCk92gjug/MBy+ASOIuq+3BYUw1bBBJ8UnUlbrmqGUu+AZw23XKaBiQSzmdUzgeTaqZSiMMFF91GInru6LtFDVGGCvuK7GDj81KK4GwFMHz4RzqGhCjyfoo/DmwVTTFJ1FfGs9blNve5N+BuyeRgxGXWQ7l8gK4fXvEaWdyzTCgr9Jn6buiiTHCWOH0aCvSWiAsvcjrKZVTV2+2UrrRZeKu0f3BHvS0VhtdsplSUwxQ3/wNvDPBP4DHQU6TQkKfImdPADk8s3DaZxJ5e9sMFB+1B/nqs/RdkcTY4BR8469MLE5Ka4HQTGlI7v65FvzK/wcTp0Vnge2D6T2x6lLfnqXwPwc/AL+bWCIGL7icyd0vCpeDp5RPtsmAPmoWiLiUY2y4psQKPrYjrQbCUqR5XK9op3gjz8Wz+nw5NSUIAzSox1DVaRavKf0xIGfnwuGj/T2Wd3fMgD5KXxVRjA3z2la89UBIo/JnNBwVRmxczrvvz9TDZm0bKvMbioEnePpB4NphSm8MyNUDQO5SgjBQfJNTovqqaGJMuLbEiFZ1bz0QltLdxfVyEG2tUPX3BodT4aLtxFL3SZX3KPgCMPIf9BxjQuVKzuQuJQADxScdhqp7BVB3aRWNBcYEY0Pr0lUgdMrlfPBk6yUePsMdSOJ48PHhk8oUWmLAQ9/tbbrmldIbA3JlO5W7lBgM6JM+DSK+QG8sMCZY51qXTgIhQ1+3YN9SEG079hrovQ/4FD2wlbmm1M+AztzDHF6uX9VqNJQrOctAWI1JVqwIvkhf7k7RvYE+KpIYA3xP9ZYSG1rXvZNAWErpiQEXgodbL/XwGTr/fiLYZPikMoUWGHC9yxFhBsLeyXZqVM5yXbV3zrq8c1My1ydt3aUSA+ZtDDAWtHKKzPJ07CwQlsjvDqHblqdY5d+tg37HgYhTEJVTO3r1qGvvk6rvEmYg7J1euXq8cNf7U3lnVwzoi1yy0TdFE2PA5V2NBiWrs0Bo5hRc5+QOUq+RxI0y24EDmJKIeHJDJK5HpesLJJRrhL2z6Tu/cpZSOQPFBx2AmvqkaJv4FsaAEgs6Y7rTQFhKPZvr1Z0xMHjGnjDjqHDfwZPIJ1tk4B3yeg7kLsjpSZcjuZKzlPoZcM/CsUCfFE3movCcrpWuIRDeDwnzQMTep0HQUWHECth13esi/2fI1JFOytQMOHL2VJ6UyhkovsfRYMQOuT5f339f1zR3HggZErsYfzOYD6L1QP29L19e3R2k1M2A64TPgxfrVrMK7eRIrlLqZ0DfYyBcu35Vl9BQX6/Pv7nEgCX+2PZ/Og+EpcAPcD0XROyt74HeJ9AzW7WUJS91MmAg1MHnhpnp7SNHtsWcRp6eq87uKD7H9wb1QdHE+qXP1/d3LlUEQnoEknIduBfosCLJFih7CNgyktITqKv1ynrmawEpUzNgILTTEK0tTl2q8furPudQoA+KJNYrff11+P4qZmiqCITFgp4ocAF4svw/ysVdWjuAY+mhfSyK0pOmJw1uUSDMEeH0xrez8FLhbPq7847WGSi+5lgy1vdE2ymqj9fX6/OrkJoCoY3vfFDFULlP62zK/Z8F+YJ9n8S1fLtB8NWW84yYnW0xXzWp23Ibo95ngL4nmujjDYTWsyqkmkBI7/NdGHH30PWgiuFyHxZanXv3BP5wb7TjjfooZvhbDYKvhS9F8wWQo+wwNM/zQDkUH+O6oD5H3xNJ9O36+PuKz69C92oCoWxAzDtcLgY3+P9g4rSoRxxtG0zvSVJXB//GJBV4wLLKUXYYBiSvhcf0MSeB9VrIa9RZ6NsvxtdXdcZ0VYGwMG5vwY0zBsVIYs/sOPCpSEpPmK4694g//dW2meQoA2HbrPeen6NBfY0+J5Lo068D+viqpLpASE/BRmivwV+niLZ9ezN09od7t+KaUh8Dr6NSBsLp7SJHOXKenqfW7yi+5QAy1tdEEn25Pv3G4uOr0r26QFjYuZ2rG2eijQpVfxY4xA8p1TFgIBQpUzOQPE3NT5d/1bfM6lKBAfN2KlSfrm+vTqoMhPQYnoapa8DDINq7TLug8+H03Dx1JqUiBqhXdqyqWpuoiJ7FVXkbrpKnxRmp4HPxKYejij4mkujDF4BrqFdP1ah4lYGwEPUA14uAu4wiiZy6TngQFXeVSIqnrslAMlAnA8WXHIR2+paa/fbyCNSHXwz06VVKzYT+BsbOBk9UydzUSu3Mnz8D8gX7qXnq4q+OClOmZiA5mpqfLv6qL9Gn7NRF5kPmqQ8/C+jTq5RqA2GZxroT1jyQ2xehI8k6KHsI2I6eXLRTHyLxPIiu6eSnZy05mp6j1u4oPmR7MtSnrNtaxqPJyJfm9eF3Fp8+mlRHnEq1gbCU05d6PYHAn2qKJluj8NFgw2iKj7m+0XYid2GO5KgL1lecpz7kSKBPiSb67gtB1Qc0VB0ISw9iNiTeBKI1Tl92PRk4TZqSDCQDycCgDOhD9CXRXqDXZ98Irqp5NIh+9S+6QuDz6Dkf3KvCgcQpUY9A2pupjbUC6Z2qJgPJQCUMFN+xN+rsBaIts+iz5xcfXgmjy1ej6hHhYirP5bMjw2jiyQ+zwG7RFB9jfXMn7/TGTY6m56itO/Qds4C+JJros+dFUDpEIKRH8QhkXg1+G4HUpXTcn/8fTs8uBNdL6T6O/00nP71Vk6PpOWr8juIzDicjfUg00VfPxXcviKB4JOd8F4ReCaIdkbUJOluRZ4KU7hmIVOe7Yis56or5JfPdhv/uB/QhkUQfra92138IiVThH4TRc8AzIZhdUkkPyT2eHt6aS36d/2uTAfh3jSVSnW+TnsXz+mjhavHv8nOLDBRf8Wmy/FSL2Y4qK320vlqfHULCOAWG2B755A6kO8BbIdj9vZJb8vF4sNHvv8pPHTCwKnmu1kG+0bKUI7lK6Y4BfYU+Q98RSfTT+mgP1w5zTF+YQFhqgmeQ+k6KJxVEEh3LrmC/HBV2ajZH5BE3HbRNmhzl7EXbrJf8io/Yl/96pmi0jtvj6OzRmPrqMBIqENLD8KdhLgO3g/fDsPyBovbwPgOi9fCC0Tylur7GssaUd+QfZUCO5CqlGwb0EZ8Fn+gm+4Fz1Sfrmy8tvnrghNp+MFQgLOQ8xPVaEKrHgb5rg6PAziClGwa0QY50pudejuQqpRsG9BH6img20CfPB/roUBIuENLTsNcxG1wXiukPlN2Uy2FMfcwMqPs4qOwZsDnSmd6SBkK5SmmZgeIbDiPbaDtFZUqf7Cky0Wbrwu6guwfCfa/wFRBJ3LV4PPCkiJT2GfAE/2i97PZZ+iAIylVK+wzoG/QR0QYpniWqT/4VCCfRyF5IMD2O1/ngieY3gWi9j53Q2U0z2eOGiLYEvu2EbADSwU9PuhytXzib/u68YyQMFJ/ge4P6iEiiD9YX3xJtbXARySEDYVHeUeG54MVFhQl03R9dD09H06rFDIQfB9EOLm6VpJKZHG0I5CylBQaKLzicrPQN0UQffA4IORqU7LCBkJ7HC+jvUDziTzR5gK7TH2uAlHYYsK7niLA3rh0RylVY/9BbMau6S1+gT9A3RBN98NXFJ0fTfaG+0Sv6w5TicvBcMPZdp9oH7ExPcOVgukdVd9HUaI4Ip7egHBkIc0Q4PVdD31F8gDtF9QnR1rD1vVcAfXFYiR4I3SxzHoj2E01WmJngFJBrVrLRvLiO4dTous1nFT4HOZIrf08upXkG9AH6An1CNNH36oOjbVxcgufQgZCh+LuU5g7gQq0baCLJxijrVMiMSEoH1tVfVNgI5C8rTG/ERVxFO9Vk+pLVeccM1NIX6BMiiT5X33t78cWRdF9C19CB0JJgAM8d9bQZDRJNdkThA5kayem65i3n5o/1m89mbHJwRLjJ2JSm0oKUtn8g6ukLook+97Lig6PpvoS+4QNhKY0vcvoDkI4QI4lTIieCT0ZSOpquOBvXujYH+cpK78azbm4Jd+PiI3ovebt32vb1AfIdSfS1+lx9b3gZi0pOj8TtuzeCaNt3ddAHgH1wOHnaP0Q0JHK7Fcj1wd4JttMgZ6v3/kje2Q8Dpc27QUYfEG1j0j3o7C9M6HvDy1gEwmIF1wovANF+uNcpKKdGtgcpzTDgkWEzQE5B986vnQYPf16j90fyzj4ZsM3b9vUBkUQfez7Q546FjFMgfAyLXAmeDGiZg9H5qIB6R1HZ80W3BRkIe7eYU3VbgwyEvXPW7522edt+NHkKhfW1+tyxkLEJhAzR3ep9H7gK/C6Ydex5H8pUyWbB9I6irs7cQJhrhL1bTK7kLANh75z1fGdp64fygG0/kuhbDYL3FZ8bSfcV6jo2gbCU8FmuZ4Foo8KV0Xl34C9T5JZ1iBixuFvU0Y08p/TGgFy5Rpg7bXvjq+e7Shs/jAds89HqpL5VH6uvHRsZq0BID+UNLOOmmduB89iR5A9Q9hSQW9ZHaDWcjo7GXnc69P55lTN3jkZz1v2XtN0nfF/Qtm6bjyT6VH2rm2T0tWMjYxUIi1Ve5HoJcJo0kqyNsu4e89i1aDvIaubZo8I+CXKKr38ryZncyWHKCBgobXsXkrKt2+YjiT71UqCPHSsZu0BIT+UdLKSxbgpoqc3Q+XgwI6DutaospzqeDIT9W0jO5E4OU0bDwAySsY1H5FSfeknxsXwcHxm7QKhpMNTTXG4Aj/r/QKLjORHofFJGw8CmJLMbyLXX/vmUsz2AHKaMhgHb9gkg2vuZj6HzDcW3joaJilIZy0BY+J3P1d1NkcQp0e3AvkyhuD6TMjwDW5DEtiCnm/vnUs5mgmhrWf2XtIUnSpvel6x8fzCa79WXjsUpMsszdTRjLK8MK/rOU2Z8leKFFd1Q6fc6nyNAxPeLqqIUx+Palh2Lj1WlWCxlfLF+28JlLM3r09Y2bdu2jUcSfaiB8O5ISvej69gGQobw/uyOJx/MBW/0Q0oF99pr9FUKjwZLGZyBHXl0p8EfzycLA3IolykDMlDasq9M2LYjib5TH3pH8amRdO9Z17ENhIWBh7ieDaLtcnKtcG+wJw0ot65DxICyK8+5PpgyHANyKJcpAzBQ2vCePGqbtm1HEn2nPlRfOrYy1oGQHsyrWO5a4DSpu0kjyc4oezKI1nCq4Bjn42/qyeFWVSgUWwk59LUeOU3pnwHbsG3Z+hhJ9Jn6zmuLL42ke1+6jnUgLEw8zfUS8FRfzHR/s9urXU/YCgcUbU2hU/YKX54kswNYvVNlxiNzOZTLrbMu9mfQwpcdiVkg2isT+kx9pz50rGXse3j0ZF6hMvqrFIcDTxiJJDNR9khgRYy26adLnnXcB4EZXSqxnLztYXs01XPATqibedYFystAG78HNgQbgZra5zbo42aPJ0C0NXdU7kzc/W0bdudyNLkLhS/Qh0ZTvF99a2po/erez/33c7PvFe4HPtHPgx3fqzP8DLgGZCDs3Rhrcauj6Rm9P9L4nQ+Tw3lgLngJrAScMvNdPeUtYIBxk9d64DBwKpgBapAZKKFDt1OZgRASehRHg7bhSH7Hoj0D9Jn6zrGXiQiE9GjeZVQ4G2seCD4dyKruGt0H7IH+nvaeDqg34zny3wOs3dvtjd6lQ7kOXAwuw4YP9ZIb9r6d+3RCJ4D9gZ2iLsXOxe5Abp/vUpEoeWNDOzrWQ9twNF97Mzpfpe/kOvbi9MykyG0U1GD4ZrAC+w7c0WD7YHp3oi7OR76cwtuiEwWWzPS3/PdH4P/CoXyn1yBoEt4LvsXH/xOYhml1LZujwMGF4651iZC/bda2a52MJM5O6Cv1mRMhExMIcSruIL0J3AKcfooi2sgpKUezKdMzMJNbHPV3/avfb6PDVeCvqXu+zzqQ8Kwjw28A0zLNLkVO5VaOU6ZnwDZr2/3o9LdWc4e+UR95c/GZ1SjWpCKRDDQKHlz8PR+8PIrEWkzD0c3+9MS3bjHPqFl9EsV1QE4rdykPk/lsnMkTwypR0phNOqbZpcip3MpxyhQM0FZdG3RKu4aZiSk0XeZP+kbXsu9c5i9j/MVEBUIcynPY0p511w5lkCplozp8kAcn5ZnSUTiI8m5YQZnvQYe56DR0GytpzCU90+xa5Nbp0a27VqTy/G2rttloom90bVBfOTEydCMNyNSD6DwbuHMvkmyHskfjgLqe8quZs0NQ7sgKFHwNHe4CD+BQ3htWn5LGAyVNp/i7Fjk+tGslas2/tNFj0M82G0n0ifpGfeREySQGwhew8Lng3mCW9t24PcHeZYQQTP1m1YWT9cnB0eDOzebUU+quscwngPne4EikpOUvqph217ITChxYOO9al6ryL21zb5SyrdpmI8l9KKtv1EdOlExcICy96xuxstuDo72OMAOdTwWbgZTCAM5nFT66O8+pKN/P61LeJ/MrgUFr1GKaTu2bR5cix3LtDIXcp/yeAdumbXTr338V4pO+0M2ENxYfGULpUSk5cYFQ4jC0U1c6K6evIsk6KKvD3z6S0i3ougF5+NJy15s4DFD2qv0B05e4jlRKmjeQqHl0HQzlWofvSDzl9wzYNm2jttVIoi90bVDfOHEykYGwWNmXnOeCoddwWq41M8jvEHriG7acb5XZwYMnsxwMHKF0/QK9TuQc8EvQlJi201evN5VBj+nK9QHAjTPaYOKltEnXqWeArmcm+rGHPnAeaGIWox89Ort3YgMhPZ+nYf16EG1hWKdzAvC0ipSPfGQbSPgi6HqbuiM069J51K3HuTYiJW0D4a9B16NCOZd7bZDyQZu0bUbrGDyEztcVnziRdpzYQFisfSvXi0CktUJ7mi7G70cP1Pe6JlYo/5oUftFOUT93Kc+S+aXAacum5V4yuAQ803RG06Qv50cBZyi65n8aVZv9c2mL+5GLbTPSaFDfpw/UF06sTHogfAzLXwa6dij9VkB7nAeCSR8V6nT+GNTwSsld6PEz8CJoWlx//EfQ5BRsr2WQe22gLSZZbIu2yWijQX2fPlBfOLEy0YGQqYC3sfzdYD7oes2l30q4Fw8cR090Im1IuTeh/KeAg/slroH7nyJNncnt1KnG15xLHneUPM27a9EGpxSbdK1L6/mXNngcGdsmI4k+T993V/GFkXQfqa4T6USXYtAe0VkgWo/IQHAAmElDjDQVg8rDSSmvazHHghqm5C5Hj4vbCIKLmCt5Xcz/zbtr0Qba4oQJrYszKbtt0TYZSfR5+j6n9SdaJj4Q4lDc6Xc1cJqp680H/VbGHXngRLBuvw8Gv9+t+38Idq2gHA+jgwGpi2lK8zRvNzt0LdpCm2ibSRLbnp0y22Ik0dc5G3Z18YGRdB+5rhMfCAujjgqvAPePnOFmE9yC5J0ejNYTHZgVRhyb8vBXwKFg5YETGs2DdqL+J5hTRmijSbXHVEqec7jdtUl16VK0hTb5SrFRl7q0mbdtzzZoW4wk+jpnE/R9Ey8ZCKkCxaFcwsebgtUId43uAvbB+awdTPe+1aWMH+Oh48HnQNejYI9PuxWcTf15mmsnUvI+m8w9eu3tTpT4fabaRNscX2z1+7+M4afS5twk5Gg42g5ufd0lxfeNoXX6K1IGwsIXFcIpruvBc/1R2Pnd66HByWBG55o0qABOx7rqrrwvg81B1+L6yo9BG69LTFdWdfgRUKeuRdt8GXgW6bj7l60pp23PNhhJ9HGefqTPS4GBca+o/RrZQOh0QSRZA2WPBLuPuePZjTL+KahhSvQt9HAq/UycyctcO5Wig6PCK4G6dSkrk7k2+hOgzcZSSlvbg8IdBWyDUcS1Qeuuvi6lMJCBcMmq4OaDy0Dnzm1Jtab9n+sUB4OZ094Z8Aaczsao/SVwKqihzs5Gjx8RgKrZbVd0+RF6qVvXoo08+/VLxXZd69NE/rY121y09flX0Fkfp69LKQzU4FSqMQbO5E2UuR04f951z7pfXuyZHtTvQ7XfjyN1XfDL4I9ADVNQ7tA8E9wIahN1UrcadpFqK2325WJDPo6VHEhpbHORRJ+mb7sNX/dGJMWb1jUD4bIML+ArnckLy/6p6m92QLuDcDo1BIuREEVZ1iWhL4B/DbYYSaLDJeLOzJ+DK0unabjURvx00clpL3VU165Fm2m7LxRbdq3PSPIvbczRoG0ukujTzgKPRFK6DV0zEC7FMs7EyuL00q9B46eELJX9MP/Vlp5scSgNdeVhEqrhWcrgustJ4N+BbSvQybowD/wjdaSGEddyKUG3h9Wx6FpD/dV22vCkYlM+xpXStlwDta1F8p/WhQeAP7X0PNeUxRiIZMjF1G7842Pk4MaDpxrPabQZ7ExyJwOnE6OL5fi3YLdKCvIr9PgmuLMSfaZSQx3VVZ1rEG2oLbVpdLFt2UGzrUWSp1HW2QJ9W8pSDGQgXIqQ8t9XufpTN7U4kuVruey3a/OVaxefpOca8tg19Qafpww6zv1ADfIoSvwUzKY3/W4NCk2lQ9HRWQ11rmUaTFv+W20buW5Shk8C25htLZLoy/Rp+raUpRjIQLgUIf4XR/I+F3dV3QR+ByLJVih7HNgoktLqioNcncsp4N8D12BqqJ+voMdF4J+oF2GcSNH1n9D7YmAZuhZtqU21rQd0a+toYpuybW0dTHF9mBupfll8WzD1m1e3BkfTfCkHyIEK8zaPXQ1uHuDxLh9Zl8xPADt2qUS/eeMY1yl6/29c3f1aw4jWDpEjq59RHx7kGkqKzj9DactQg2hTbauNPaBbm0cS25RtyzYWSfRhVxefFknv1nTNQDg11fP581Wg+umwxYqhTV2T2RdHE2L6powOnA79P4DTTrXUy7vR5QfgWhBVrMOW4ZeVFEDbamNt7TRpiJFhaUv7orNtq5b6iSrTiptk9GHWg5QVMBDJoCsoQnNf04NySukG4OYDK1QUccfl0WDP2hXGwWyAjn8B/lewN6ilTj6JLqeBy6kH73ANKWUUcDnKfxNYphpEG2trbf4XpQ7UoNdUOtiWbFO2rSiiz7oDeJyavixlBQzU4nRWoF4VX9+FFheAaC+g7o/OB+NkqrUxus1Ex6+Dr4FdQS3yLIr8FHiEWngHUspwZimTZatFtLm2/3qpC7XotYQepQ0dzJe2qUiiz9J36cNSpmCgWic5hc6t/gkn8hsydNvxo61mPHxmG5KEO/V2GD6p0aaAY1kV2MP+KnDzxHajzWGo1Ax854PvY/tnhkqpoocpiwHw+8Cy1RTctb114KvWCesGn2uT7VHItmSbiiS+KnFF8WGR9G5d1wyEvVF+H7e5cSbaDlKDjZsSqlmHQZc10ekY8H+Dr4OPg1rEqaRLwT/gPLT5WEkp0z9QKMtY01S/dcC6YJ04ptQRPnYvpe2ciCa2pUjyMsrqs8auHjdhhAyEvbHqyOAc8EBvt1dz15Zo4rrGJ2rQCKeyKXr8Jfh/wPGgmgCNLgaG+eB04FbzcRXLdjqwrDUFQ+uCdeI/At83tK7UILYd25BtKZL8GmXPBmMzq9Ek+as0mfi4pE1P+j0a5nWU51awC6jJgU9Fs/bdGbhWeAHleHWqm5v6G3mrxyHgD4G96xmgNrGT8z1wNTx5OPFYimXDHo4UNgAbg5qmzm1Xe4ONwJbo+Quu89C5k13b5L82+bs2aBuK5Cutv7eB6+Cups4OKtUpkYzbKYNUqJdoGLNRwgVzt1BHEZ2KAegW0PqIFs5mku9h4AvAHn+NsxCupfw9OB87O6U01mIZscv5FHIz4JRkbaOdrdHJncTbCHS9Gp0f4nPbIj+2HdtQJHE61FOQXoqkdJe6ZiDsj/153O4LwbuClfp7tLO77dU6GtsZh/IwjaOV3jV5eSbjJ8EXwefAH4Aa5VmU+jFwc8yLNSrYhE6WFRt9n7TXB38OanP2dphOAHuAs9BVG92L3q2s05PfyuS3cDaFq20oiryPonOBviqlRwZq7J33qHontz1Orq6tPNpJ7oNnqpM7Gmw7eBK9P4kTMZ+vgdPAl0CtQdAe8+ngWzjY57lOlJQyf4tCnw5qHT1sgW7WIevS10rd4mPjYh22zXyi8ZxGm8FjJKeP8prSIwOr9Hhf3gYDOA7a4fs38fEK8GdgVRBBtPOJ4Fpwf1MKw41TWscBHcgBoLYpN1T6UF7n0w/Bt7Hr4x9+O2EfLDt2+zbFXg38OXBXb23i7MI+YBPgKxa2v0vR/RGuTcmeJOyINJKPfBt95eZmfRXXlB4ZiGTkHovU+G02vkuAjcQ1hCgyE0U9ds33ip4bpdKkuQ3p7QVmgWPBDqBmMQieCb4DF12sPVXFjRxgw++glK8xOI29VlUK/l4ZO1bC6dLd0HkO11vR/2GuIxPS3ZDE9gWOCiOJ0/wXgyY7CJH46FnXDIQ9U/XBjTQ6d93dzv9uBp8GkTh0B9wh4FwwlMCBIwinjVwHdBPMqWB7ULsYBC8Cf4Mt76ld2bb0kwts+jfktwZw9qDGkeEiOuxoCWcfzkVvO6b3gmdsn1yHFduIbSWSvIOy+qTb4eDNSIrXoGskJ14DX4t0eJIPZwEX0yP1Gt2afjSOw2mlN/jct/Dsyjy0AdBZnALcEboJWAfULu+h4IXgv4Lbale2A/3kRG4UR4a17yGw4/VvwGfBXHAe9fMari9QvwfaFMbzdgSOBraVSOIoUJ+kb0rpk4EMhH0S5u00stdoMFfwUWcRKRCuir57AddZbqIc9iJ7Fp7ZlZtngQOAr5DMBBECIGp+xDUTp0P/B7DsuYYCEYuLnFgv+O5vgZ2GL4CVQM1i/RN2xgxed4HrKcccyvNLPvcsPKM/dG3QNmJbiSS/QtkrKfNrkZSuRdcMhANaggrnJoOredxG4862KLIjijqSc1pw2tcFKKNlM+jtAnQ0blqIMAWKmh+KowNHgv8fdrvmw2/zwzIMwI8dhGuxuwFw0TSpswC1i8Fw94L9uB5EGW7lajC8i3I9wXU6MY2TgW0kklg2fdHjkZSuSdcMhMNZ4zIed3T0h8Ml0+rTG5Lb0eDnQEexhOA8nA6zd+36n6Ndg9+R5boa12jiFPAc8A0wH6T0xsB13CZnjoyOAAbFKGJHTXwe3AKuol57fRA8A35DYHTEu7RswxfHANtIJNFWl5VOTCS9q9E1A+Fwpribx62Ex4KPDZdUq08b4A7FOTxI4/HEHJ2dQc4yuO5p4HMNcCdgL1kn6AghmryNwpcDHfq1lHWgdaNohR6FvnJFvbiWtP5fII9uDLOeRBLrtB3VT4FXgLMg1wADo1OJvwNvUda3+f96fD4UbAciiWW4HuiLUgZkIAPhgMT5GA3IM0ithHOBr1M4moogNvqTwF3oby9ZB+CUp4Fvc7BoRMjHsOIU31ngNOCZixkE+zTlYsFQ7l4HfwSidYjUd80CZzms46eAJ4HB8BbagMHRzuHJIFKH1lGtvud6fRHXlAEZiFapByxmc4+VnuQXyeGvwNrN5TTylO1JOpp9Diza/bruyHPpJkG3j58JXBO0o5IyJAPUc0dWfwmcblx9yORqedw28BBwpOh0qGWMFAhfRd//AH5MPbcsKQMykCPCAYlb9BgV0KnFm/i/i/J7gyic2uCPA+MmL1Og88BfY5tbx61wXZXHDgX13Hf0HGmfDCIFjBXRZhmcNhXRxB3f+hx3QGcQHNJ6Uabyhixm448vIIdzwAuN55QZTMWAPeRfgP+UQXAqmgb7W+H0P/G0o225TumOAX2NPmdBdyqMT84ZCEdjy+dI5kKwYDTJZSoDMKBj+D74Lzhs135SGmCgcPufSVqus+PXAMc9JrmA+/Q5+p6UIRnIQDgkgT6Oc3Ch2rUGF65/C1LaZeBRsvsfwDXB+9vNevJyg+NfyzWQc7lPaZcBXwGZBx4qvqfd3McwtwyEozOq76t5hqcL7yntMSDfpwEP0HYHbEoLDBSuv0NWcp91vgXOF8vCGQ99jT4nZQQMZCAcAYkmgWNwi7mbZm4GeegtJDQsbha4BTgyOQ3+n244v0x+KQYK5wZCbaAttElKswzoW/QxNxaf02xuE5J6BsIRGpqKaQ/NKQsrakpzDDgVPRu4VnUGvL/aXFaZ8lQMFO7P4B5toU20TUpzDOhb5hVf01wuE5ZylK3+kcxiINwLHBxJ6UC6GvR+AX4IfJH49UC6j6WqBkNerbiIwrlxwxfVPw/WASmjZ+AqktTHpIyQgQyEIyTTpHAKz+MUbuDjA2BbvwIpo2HgEZI5EzgKvGM0SWYqo2CgdEjmUPfdSWpANBhuPYq0M42FDPj+pmvgdv6eT05Gy0BOjY6Wz0WpuZh9AcjRyiJGhrvqBOTU9ai/yiA4HJlNPl1s4ylL2kqbabuU4Rlw2UWfIqcpI2YgA+GICS3JPcr1QvBUM8lPVKqeZjIf/EfwTRztbyaq9AELW2z0zWIzbacNU4ZjQF9yEdC3pIyYgZwaHTGhJocj8DBue246gY3BuiClfwZe4hFPzzgd3ACvOcKGiAiirWgD56GrHZcvg8+A9UBK/wy8zCP6krv1Lf0/nk9Mx0AGwukYGvzvz/Lo2WBPsOvgyUzsk64BngXOpfHnemDAalA6LovWDR+iCJ8DewQsStcqOwrUl+hTUhpgIANhA6SaJE7gLXrE7u66DewIov2WGyp3Iq+Q643gR+AceHyxEy0y05ExYEeGtuBGJx36PwP7gdxVCgk9iO9m6kN8ZSKnmHsgbJBbMhAOwlqPz1Bxn8UBzOV2G77BMGVqBjye7mLwbXAz/HlIQcoYMIAtX6Qt2Lm5B/wb8GmwCUiZmgFH0lfDn8eqpTTEQAbChohdLNkr+XwAyEC4GCnL+Xg7350BzqLRO3pIGTMGsKsdmxsIiJ4C5HT3nwGXDlJWzICzSvqQlAYZyEDYILkl6QVcXeg+AWwGUpZkwHfO3BbuGsg1OEv/nzLGDNjRKaPDReuGJ1HcDce4yIMWzQ6DvmPBoAnkc70xkIGwN54GvotGT5tf+MO9TpH+LwMnNH4Put7h2scl4J/gyV22KRPCQOnwnEfb8OCJBeB44OhwNZDyAQP6DH94N9/FbLhG5KknDRNs8jT2Nbh8FvxnsDWYdHEtcA5wKvQKGnoeUg4Rkyq0j9Up+9Hgn4EjgK8cTbq4PPC/g7NpDg7WxgAABAVJREFUH75Mn9IgAxkIGyR38aRp7E6Lfg38c7D54n+boM+uEd0FfgB8x+wJGvnbXFMmnAHah7uqtwCngC+D3cHKYBLlSQptG/FXVZ6aRALaLnMGwhYZp7HPILt/CdwksBWYJFlAYQ1+FwGne/K8RIhIWZIB2sjH+WYfcCJwFmVLMEnyKIV1puTvaSMLJqngXZY1A2HL7NPQtyHLL4AvAnu94y5PUMDrwGXAadCHx73AWb7hGaCdzCSV44Brh/uDSXjV4k7K+RPw82wnsNCiZCBskexFWdHIN+DzqeAr4FPANcRxE1+Evw84AnQzzL3jVsAsT/MM0Fb2IJc/AgbFbcH6YNzENUBfH/ou8CSlF8atgLWXJwNhRxaigRv8DgRfBceA9cA4iGt+jgLPBT8Fno/4KteUZGAgBmgrntW7G/hjcDJwLXFVMA7yEoW4HHwLXEdbyY0xHVg1A2EHpC/Kkgb+UT7vAHyP6k/AXiCyPIjyjgBt2HfQqF3vSEkGRsIA7cV1dZcT7Di6hugIMbLcgvI/A75Hez/t5b3IhYmsewbCCqxHA3eDwBHA3q7XaBtpfonOrgPOA/5w6K+5piQDjTBAe9mehA8AhwJnVXYFkcQO4mxwvlfaS24c69h6GQg7NsDi2dPAt+P/nwe+U7UjqHnHnI3XBn03sFFfniNAWEhpjYEyQnR0aOdxF2AH0k5lrfIYit0HrgBn0l48TCClAgYyEFZghMVVoHG79uGUj1M/jhBt4OuC1UHX8joKCAPgVeAS4PTOSzTqd7mmJAOtMkB7WZkMXV/fG7jD9EhgQFyzgEun8ia5vwzsMDoCvBA8SHt5m2tKJQxkIKzEEEurQQN3Z+kWYE9g47bXuzXoQvwpmHvAfOD0p5+fAr/NAAgLKZ0zUALixiiyGdgJOG16UPnc1VGSj5C/syV2Gm8DHiCRO0IhojbJQFibRZbSp4wQP8nXwo01rofY0J1GXRs0Ie+TqI3YtT6D3sPAaZwHwa9pzAbGlGSgSgZoMwY+1xGdWREzgW3G7+xMNuX33B1tO7HNuG5+P7hX5AgQFiqWpipExUWOq1rp9e5GCQyGBkYbtb1gR49iHWBwXAs4ZTSVOJX5OngN/K7Ad/+eA08Ag9/CBk0jdvSXkgyEZIB24yhxUQdyGz4707Ih8J3EjxXYZpxO7aXd2GYMeq8AR3jC83PtPBr4DIJ30W5yuQAiIkgGwghWWkxHGvVH+a+N1bVEG++mwIYuNgI2bmFAdF1xNeC97wMbpmsTBkAbsTD4PQN+U2DQMzAuvDcbM0ykhGegdCJtB7Ydg5/tZZOCT3C1zdiRFAbERffqI20zb4E3gQHQNiOeBbYX8TQwQHrvu7Sb97imBGHg/wfZU2QdjMq5JwAAAABJRU5ErkJggg=="></image>
                        </g>
                    </g>
                    <g id="Clipped">
                        <mask id="mask-8" fill="white">
                            <use xlink:href="#path-7"></use>
                        </mask>
                        <g id="矩形"></g>
                        <g id="编组" mask="url(#mask-8)">
                            <g transform="translate(-10.314815, 31.481481)">
                                <path d="M70.875,18.9814815 C70.875,29.462963 55.0092593,37.962963 35.4351852,37.962963 C15.8611111,37.962963 0,29.462963 0,18.9814815 C0,8.5 15.8703704,0 35.4351852,0 C55,0 70.875,8.5 70.875,18.9814815" id="路径" stroke="none" fill="#FFFFFF" fill-rule="nonzero"></path>
                                <path d="M20.037037,10.1851852 C20.5194809,9.19717311 20.8503529,8.14212827 21.0185185,7.05555556 L18.8888889,7.05555556 C18.3512836,8.35940557 17.539752,9.532495 16.5092593,10.4953704 L15.6111111,9.375 C17.0570563,7.9798188 18.0368809,6.17215563 18.4166667,4.19907407 L19.7222222,4.4212963 C19.6111111,4.88425926 19.4861111,5.34722222 19.3518519,5.81018519 L22.2777778,5.81018519 L22.2777778,6.97222222 C21.9804547,10.5413382 19.936914,13.7323123 16.8194444,15.4953704 L15.9212963,14.3842593 C17.3199816,13.6218581 18.5203395,12.5420116 19.4259259,11.2314815 C18.8701333,10.7892767 18.2678136,10.408946 17.6296296,10.0972222 L18.3148148,9.08796296 C18.9253954,9.39297255 19.502578,9.76069368 20.037037,10.1851852 M24.3240741,4.16666667 L24.3240741,7.87037037 C25.3194444,8.58333333 26.3425926,9.39351852 27.375,10.287037 L26.5648148,11.5092593 C25.6944444,10.5833333 24.9444444,9.87962963 24.3240741,9.3287037 L24.3240741,15.7407407 L22.9861111,15.7407407 L22.9861111,4.20833333 L24.3240741,4.16666667 Z" id="形状" stroke="none" fill="#59B26A" fill-rule="nonzero"></path>
                                <path d="M20.037037,10.1851852 C20.5194809,9.19717311 20.8503529,8.14212827 21.0185185,7.05555556 L18.8888889,7.05555556 C18.3512836,8.35940557 17.539752,9.532495 16.5092593,10.4953704 L15.6111111,9.375 C17.0570563,7.9798188 18.0368809,6.17215563 18.4166667,4.19907407 L19.7222222,4.4212963 C19.6111111,4.88425926 19.4861111,5.34722222 19.3518519,5.81018519 L22.2777778,5.81018519 L22.2777778,6.97222222 C21.9804547,10.5413382 19.936914,13.7323123 16.8194444,15.4953704 L15.9212963,14.3842593 C17.3199816,13.6218581 18.5203395,12.5420116 19.4259259,11.2314815 C18.8701333,10.7892767 18.2678136,10.408946 17.6296296,10.0972222 L18.3148148,9.08796296 C18.9253954,9.39297255 19.502578,9.76069368 20.037037,10.1851852 L20.037037,10.1851852 Z M24.3240741,4.16666667 L24.3240741,7.87037037 C25.3194444,8.58333333 26.3425926,9.39351852 27.375,10.287037 L26.5648148,11.5092593 C25.6944444,10.5833333 24.9444444,9.87962963 24.3240741,9.3287037 L24.3240741,15.7407407 L22.9861111,15.7407407 L22.9861111,4.20833333 L24.3240741,4.16666667 Z" id="形状" stroke="#59B26A" stroke-width="0.75" fill="none"></path>
                                <path d="M35.8472222,15.5185185 C35.1764251,15.5185586 34.5075306,15.4471684 33.8518519,15.3055556 C33.3390267,15.1527866 32.8820242,14.8534821 32.537037,14.4444444 C32.3611111,14.2314815 32.212963,14.1342593 32.0740741,14.1342593 C31.8240741,14.1342593 31.4027778,14.6805556 30.7777778,15.8055556 L29.8194444,14.9166667 C30.2187734,14.1609487 30.7895771,13.5092812 31.4861111,13.0138889 L31.4861111,9.59722222 L29.8518519,9.59722222 L29.8518519,8.40277778 L32.7083333,8.40277778 L32.7083333,13.1388889 L32.8425926,13.2731481 C33.0885586,13.5664139 33.3829382,13.8153839 33.712963,14.0092593 C34.2348503,14.2259654 34.7961508,14.3316034 35.3611111,14.3194444 C36.0833333,14.3194444 36.9166667,14.3472222 37.8888889,14.3472222 C38.5138889,14.3472222 39.1342593,14.3472222 39.7824074,14.3472222 C40.4305556,14.3472222 40.9074074,14.2962963 41.2407407,14.2731481 L40.9305556,15.5555556 L38.0925926,15.5555556 C37.4074074,15.5555556 36.6574074,15.5555556 35.8611111,15.5555556 M33.0833333,6.2962963 L32.1574074,7.22222222 C31.5544843,6.47043704 30.8644741,5.79285944 30.1018519,5.2037037 L31,4.35648148 C31.7541898,4.94084783 32.4545191,5.59159627 33.0925926,6.30092593 M36.5324074,9.02777778 C36.6002098,8.54139712 36.6373202,8.05122987 36.6435185,7.56018519 L34.0509259,7.56018519 L34.0509259,6.31944444 L35.4398148,6.31944444 C35.1629833,5.78319786 34.8424554,5.27066284 34.4814815,4.78703704 L35.6388889,4.22685185 C36.0116648,4.80201829 36.3472279,5.40046493 36.6435185,6.01851852 L35.9953704,6.34259259 L37.7916667,6.34259259 C38.1494749,5.62966459 38.4588181,4.89342773 38.7175926,4.13888889 L39.9398148,4.57407407 C39.7084838,5.18283063 39.4330618,5.77390471 39.1157407,6.34259259 L40.4490741,6.34259259 L40.4490741,7.54166667 L37.9166667,7.54166667 C37.9166667,8.08796296 37.8657407,8.58796296 37.8148148,9.00925926 L40.8703704,9.00925926 L40.8703704,10.2314815 L37.5925926,10.2314815 C37.2037037,11.654321 36.1234568,12.8595679 34.3518519,13.8472222 L33.5277778,12.787037 C34.9166667,12.125 35.7962963,11.2777778 36.2222222,10.2314815 L33.6296296,10.2314815 L33.6296296,8.98611111 L36.5324074,9.02777778 Z M40.8703704,12.8611111 L39.9444444,13.8611111 C39.1823623,13.0273234 38.3386405,12.2720062 37.4259259,11.6064815 L38.1851852,10.7453704 C39.1334297,11.3803696 40.031166,12.0877239 40.8703704,12.8611111" id="形状" stroke="none" fill="#59B26A" fill-rule="nonzero"></path>
                                <path d="M35.8472222,15.5185185 C35.1764251,15.5185586 34.5075306,15.4471684 33.8518519,15.3055556 C33.3390267,15.1527866 32.8820242,14.8534821 32.537037,14.4444444 C32.3611111,14.2314815 32.212963,14.1342593 32.0740741,14.1342593 C31.8240741,14.1342593 31.4027778,14.6805556 30.7777778,15.8055556 L29.8194444,14.9166667 C30.2187734,14.1609487 30.7895771,13.5092812 31.4861111,13.0138889 L31.4861111,9.59722222 L29.8518519,9.59722222 L29.8518519,8.40277778 L32.7083333,8.40277778 L32.7083333,13.1388889 L32.8425926,13.2731481 C33.0885586,13.5664139 33.3829382,13.8153839 33.712963,14.0092593 C34.2348503,14.2259654 34.7961508,14.3316034 35.3611111,14.3194444 C36.0833333,14.3194444 36.9166667,14.3472222 37.8888889,14.3472222 C38.5138889,14.3472222 39.1342593,14.3472222 39.7824074,14.3472222 C40.4305556,14.3472222 40.9074074,14.2962963 41.2407407,14.2731481 L40.9305556,15.5555556 L38.0925926,15.5555556 C37.3935185,15.5416667 36.6435185,15.5277778 35.8472222,15.5185185 Z M33.0694444,6.25925926 L32.1435185,7.18518519 C31.5405954,6.4334 30.8505852,5.7558224 30.087963,5.16666667 L30.9861111,4.31944444 C31.7401017,4.90234271 32.4404248,5.55153602 33.0787037,6.25925926 L33.0694444,6.25925926 Z M36.5092593,8.98611111 C36.5770616,8.49973046 36.6141721,8.00956321 36.6203704,7.51851852 L34.0509259,7.51851852 L34.0509259,6.31944444 L35.4398148,6.31944444 C35.1629833,5.78319786 34.8424554,5.27066284 34.4814815,4.78703704 L35.6388889,4.22685185 C36.0116648,4.80201829 36.3472279,5.40046493 36.6435185,6.01851852 L35.9953704,6.34259259 L37.7916667,6.34259259 C38.1494749,5.62966459 38.4588181,4.89342773 38.7175926,4.13888889 L39.9398148,4.57407407 C39.7084838,5.18283063 39.4330618,5.77390471 39.1157407,6.34259259 L40.4490741,6.34259259 L40.4490741,7.54166667 L37.9166667,7.54166667 C37.9166667,8.08796296 37.8657407,8.58796296 37.8148148,9.00925926 L40.8703704,9.00925926 L40.8703704,10.2314815 L37.5925926,10.2314815 C37.2037037,11.654321 36.1234568,12.8595679 34.3518519,13.8472222 L33.5277778,12.787037 C34.9166667,12.125 35.7962963,11.2777778 36.2222222,10.2314815 L33.6296296,10.2314815 L33.6296296,8.98611111 L36.5092593,8.98611111 Z M40.8703704,12.8611111 L39.9444444,13.8611111 C39.1823623,13.0273234 38.3386405,12.2720062 37.4259259,11.6064815 L38.1851852,10.7453704 C39.1334297,11.3803696 40.031166,12.0877239 40.8703704,12.8611111 L40.8703704,12.8611111 Z" id="形状" stroke="#59B26A" stroke-width="0.75" fill="none"></path>
                                <path d="M46.7638889,4.81481481 L46.7638889,4.16666667 L48.0509259,4.16666667 L48.0509259,4.81481481 L50.0185185,4.81481481 L50.0185185,5.93518519 L48.0509259,5.93518519 L48.0509259,6.48148148 L49.7175926,6.48148148 L49.7175926,7.54166667 L48.0138889,7.54166667 C47.9861111,7.74074074 47.962963,7.91666667 47.9398148,8.08796296 L50.0185185,8.08796296 L50.0185185,9.21296296 L47.6018519,9.21296296 C47.498509,9.4318213 47.3809746,9.64369248 47.25,9.84722222 C46.6481425,10.5633594 45.8396353,11.075953 44.9351852,11.3148148 L44.2731481,10.2685185 C44.9715124,10.0831823 45.6096789,9.71942746 46.125,9.21296296 L44.1111111,9.21296296 L44.1111111,8.10185185 L46.6296296,8.10185185 C46.6666667,7.93055556 46.7037037,7.74074074 46.7268519,7.55555556 L44.6851852,7.55555556 L44.6851852,6.48148148 L46.7638889,6.48148148 L46.7638889,5.93518519 L44.375,5.93518519 L44.375,4.81481481 L46.7638889,4.81481481 Z M50.3796296,10.2453704 L50.3796296,11.2824074 L54.2175926,11.2824074 L54.2175926,13.8101852 C54.2175926,14.5833333 53.7916667,14.9814815 52.9722222,14.9814815 L51.9351852,14.9814815 L51.6018519,13.7731481 L52.5601852,13.8240741 C52.8101852,13.8240741 52.9351852,13.7222222 52.9351852,13.5231481 L52.9351852,12.5 L50.3796296,12.5 L50.3796296,15.7916667 L49.0833333,15.7916667 L49.0833333,12.5 L46.5787037,12.5 L46.5787037,15.0787037 L45.2824074,15.0787037 L45.2824074,11.2824074 L49.0833333,11.2824074 L49.0833333,10.2453704 L50.3796296,10.2453704 Z M54.9537037,4.51388889 L54.9537037,5.41203704 C54.6713517,6.03814382 54.3335873,6.63775299 53.9444444,7.2037037 C54.6805556,7.75462963 55.0509259,8.26388889 55.0509259,8.74074074 C55.0947256,9.42328497 54.635099,10.0361205 53.9675926,10.1851852 C53.5139869,10.3012154 53.0468372,10.3557161 52.5787037,10.3472222 L52.1157407,9.11111111 C52.4547376,9.15936767 52.7964998,9.18565707 53.1388889,9.18981481 C53.5138889,9.16203704 53.6990741,9.01388889 53.6990741,8.72685185 C53.6990741,8.43981481 53.2824074,7.91666667 52.4444444,7.2037037 C52.8357942,6.74325364 53.1786544,6.24370174 53.4675926,5.71296296 L51.8518519,5.71296296 L51.8518519,10.6481481 L50.5555556,10.6481481 L50.5555556,4.51388889 L54.9537037,4.51388889 Z" id="形状" stroke="none" fill="#59B26A" fill-rule="nonzero"></path>
                                <path d="M46.7638889,4.81481481 L46.7638889,4.16666667 L48.0509259,4.16666667 L48.0509259,4.81481481 L50.0185185,4.81481481 L50.0185185,5.93518519 L48.0509259,5.93518519 L48.0509259,6.48148148 L49.7175926,6.48148148 L49.7175926,7.54166667 L48.0138889,7.54166667 C47.9861111,7.74074074 47.962963,7.91666667 47.9398148,8.08796296 L50.0185185,8.08796296 L50.0185185,9.21296296 L47.6018519,9.21296296 C47.498509,9.4318213 47.3809746,9.64369248 47.25,9.84722222 C46.6481425,10.5633594 45.8396353,11.075953 44.9351852,11.3148148 L44.2731481,10.2685185 C44.9715124,10.0831823 45.6096789,9.71942746 46.125,9.21296296 L44.1111111,9.21296296 L44.1111111,8.10185185 L46.6296296,8.10185185 C46.6666667,7.93055556 46.7037037,7.74074074 46.7268519,7.55555556 L44.6851852,7.55555556 L44.6851852,6.48148148 L46.7638889,6.48148148 L46.7638889,5.93518519 L44.375,5.93518519 L44.375,4.81481481 L46.7638889,4.81481481 Z M50.3796296,10.2453704 L50.3796296,11.2824074 L54.2175926,11.2824074 L54.2175926,13.8101852 C54.2175926,14.5833333 53.7916667,14.9814815 52.9722222,14.9814815 L51.9351852,14.9814815 L51.6018519,13.7731481 L52.5601852,13.8240741 C52.8101852,13.8240741 52.9351852,13.7222222 52.9351852,13.5231481 L52.9351852,12.5 L50.3796296,12.5 L50.3796296,15.7916667 L49.0833333,15.7916667 L49.0833333,12.5 L46.5787037,12.5 L46.5787037,15.0787037 L45.2824074,15.0787037 L45.2824074,11.2824074 L49.0833333,11.2824074 L49.0833333,10.2453704 L50.3796296,10.2453704 Z M54.9537037,4.51388889 L54.9537037,5.41203704 C54.6713517,6.03814382 54.3335873,6.63775299 53.9444444,7.2037037 C54.6805556,7.75462963 55.0509259,8.26388889 55.0509259,8.74074074 C55.0947256,9.42328497 54.635099,10.0361205 53.9675926,10.1851852 C53.5139869,10.3012154 53.0468372,10.3557161 52.5787037,10.3472222 L52.1157407,9.11111111 C52.4547376,9.15936767 52.7964998,9.18565707 53.1388889,9.18981481 C53.5138889,9.16203704 53.6990741,9.01388889 53.6990741,8.72685185 C53.6990741,8.43981481 53.2824074,7.91666667 52.4444444,7.2037037 C52.8357942,6.74325364 53.1786544,6.24370174 53.4675926,5.71296296 L51.8518519,5.71296296 L51.8518519,10.6481481 L50.5555556,10.6481481 L50.5555556,4.51388889 L54.9537037,4.51388889 Z" id="形状" stroke="#59B26A" stroke-width="0.75" fill="none"></path>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const platformLogoWechat = (width = 60, height = 60) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 88 88" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>编组 6</title>
    <g id="配送回传率" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="编组-6">
            <circle id="椭圆形备份-3" stroke="#44B035" stroke-width="4" cx="44" cy="44" r="42"></circle>
            <g id="微信" transform="translate(19.000000, 19.000000)">
                <path d="M7.68894076,0 L42.3110592,0 C46.5522232,0.0127311823 49.9871819,3.42439461 50,7.63679573 L50,42.3632043 C49.9871819,46.5756054 46.5522232,49.9872688 42.3110592,50 L7.68894076,50 C3.44777682,49.9872688 0.0128181125,46.5756054 0,42.3632043 L0,7.63679573 C0.0128181125,3.42439461 3.44777682,0.0127311823 7.68894076,0 L7.68894076,0 Z" id="路径" fill="#44B035"></path>
                <path d="M16.9445863,7.01085929 C17.5834397,6.93713309 18.2257743,6.89897371 18.8687189,6.89655172 L19.0185017,6.89655172 C19.664317,6.89906602 20.3095228,6.9372246 20.9512757,7.01085929 C21.2076346,7.04016892 21.4611132,7.07534048 21.7145917,7.11637396 C21.913342,7.14861456 22.1120922,7.18378612 22.3108424,7.2248196 C22.5095926,7.26585309 22.6449732,7.29223176 22.8091582,7.33033428 L23.2498652,7.43584895 L23.6444852,7.54429459 L24.0074204,7.64980927 L24.3415513,7.7582549 C24.445247,7.7904955 24.5518232,7.82566706 24.655519,7.86376958 L24.9435628,7.96928426 L25.2316066,8.07772989 L25.4937265,8.18324457 L25.747205,8.28875924 L25.9891618,8.39720488 L26.2195969,8.50271956 L26.4413906,8.60823423 L26.654543,8.71667987 L26.8619346,8.82219455 L27.0606848,8.93064018 L27.2536741,9.03615486 L27.4380222,9.14166954 L27.6194898,9.25011517 L27.7951965,9.35562985 L27.9651423,9.46114452 L28.1322078,9.56959016 L28.2935123,9.67510484 L28.4490559,9.78061951 C28.5009038,9.81579107 28.5527517,9.85096263 28.6017192,9.88906515 L28.7515019,9.99457983 L28.8955238,10.1000945 L29.0366653,10.2085401 L29.1749263,10.3140548 L29.3103069,10.4225005 L29.4399266,10.5280151 L29.5695464,10.6335298 L29.6962856,10.7419754 L29.817264,10.8474901 L29.9382424,10.9530048 L30.0563404,11.0614504 L30.1686775,11.1669651 L30.2810146,11.2724798 L30.3904712,11.3809254 L30.4999278,11.4864401 L30.6036236,11.5919548 L30.7073194,11.7004004 L30.8081347,11.8059151 L30.9060696,11.9143607 L31.0011241,12.0198754 L31.0961785,12.1253901 L31.1883525,12.2338357 L31.2776461,12.3393504 L31.3669397,12.4448651 L31.4533529,12.5533107 L31.5368856,12.6588254 L31.6204183,12.76434 C31.6492226,12.7995116 31.6751466,12.8376141 31.7010705,12.8727857 L31.7817228,12.9783004 C31.8076467,13.0134719 31.8335707,13.0486435 31.8566142,13.086746 L31.934386,13.1922607 L32.0092774,13.2977754 L32.0812883,13.406221 L32.1504189,13.5117357 C32.1763428,13.5469072 32.1965059,13.5820788 32.2195494,13.6172503 L32.2886799,13.725696 L32.35493,13.8312107 L32.42118,13.9367253 L32.4816692,14.045171 C32.5047127,14.0803425 32.5248758,14.1155141 32.5450389,14.1506856 L32.6055281,14.2562003 L32.6631368,14.364646 C32.6832999,14.3998175 32.703463,14.4349891 32.7207456,14.4701606 L32.7783544,14.5786063 L32.8330827,14.6841209 L32.8849306,14.7896356 L32.9367785,14.8980813 L32.9886263,15.0035959 L33.0375938,15.1091106 C33.0375938,15.1442822 33.0692786,15.1823847 33.0865612,15.2175562 C33.1038439,15.2527278 33.1153656,15.2878994 33.1326482,15.3230709 L33.1758548,15.4285856 L33.2219418,15.5370312 L33.2651484,15.6425459 C33.2651484,15.6777175 33.2910723,15.712889 33.3054745,15.7480606 C33.3198767,15.7832321 33.3313985,15.8213347 33.3458007,15.8565062 L33.3861268,15.9620209 C33.3861268,15.9971925 33.4091703,16.032364 33.4235725,16.0704665 L33.4581377,16.1759812 L33.4955834,16.2814959 L33.5301487,16.3899415 C33.5301487,16.4251131 33.5503118,16.4602846 33.5618335,16.4954562 C33.5733553,16.5306278 33.584877,16.5657993 33.5935183,16.6009709 C33.6021597,16.6361424 33.6136814,16.674245 33.6252032,16.7094165 C33.6367249,16.7445881 33.6453662,16.7797596 33.6540075,16.8149312 C33.6626488,16.8501027 33.6741706,16.8852743 33.6828119,16.9204459 L33.7087359,17.0288915 C33.7087359,17.0640631 33.7288989,17.0992346 33.7375402,17.1344062 C33.7461816,17.1695777 33.7519424,17.2047493 33.7605837,17.2428518 C33.7692251,17.2809543 33.7778664,17.3131949 33.7836272,17.3483665 L33.8009099,17.4157786 L33.8009099,17.4157786 C33.5330291,17.3835381 33.2680288,17.3600903 32.9972677,17.3454355 C32.7927566,17.3454355 32.5882454,17.3278498 32.3808539,17.3278498 C32.1734624,17.3278498 31.9142229,17.3278498 31.6837879,17.3454355 C31.3006896,17.3659523 30.9204718,17.4011238 30.5488953,17.4509502 C30.3271016,17.4831908 30.1081883,17.5183624 29.889275,17.5593958 C29.7193291,17.5916364 29.5493833,17.626808 29.3823179,17.6649105 C29.2152525,17.703013 29.0942741,17.7323227 28.9473717,17.7704252 L28.5729148,17.8788708 C28.4576973,17.9111114 28.3453602,17.946283 28.2330231,17.9843855 L27.9219358,18.0899002 L27.633892,18.1983458 L27.3660112,18.3038605 L27.1125327,18.4093752 L26.8763368,18.5178208 L26.6487822,18.6233355 L26.4356297,18.7317811 C26.3664992,18.7640217 26.2973687,18.8021242 26.2311186,18.8372958 L26.0352488,18.9428105 L25.8451399,19.0512561 L25.6636723,19.1567708 L25.490846,19.2622855 C25.4332373,19.297457 25.3756285,19.3326286 25.3209002,19.3707311 L25.1595957,19.4762458 L25.0011716,19.5817605 L24.8485084,19.6902061 L24.701606,19.7957208 L24.5575841,19.9012354 L24.4193231,20.0096811 L24.2839425,20.1151958 L24.1514423,20.2236414 L24.0275835,20.3291561 L23.9008442,20.4346707 L23.7798658,20.5431164 L23.6646483,20.6486311 L23.5494308,20.7541457 L23.4370937,20.8625914 L23.3276371,20.968106 L23.2210608,21.0736207 L23.1173651,21.1820664 L23.0165497,21.287581 C22.9848649,21.3227526 22.9502997,21.3579242 22.9186149,21.3960267 L22.82068,21.5015413 L22.7256255,21.607056 C22.6968211,21.6422276 22.6651363,21.6773991 22.6363319,21.7155017 L22.5441579,21.8210163 L22.4577448,21.926531 L22.3713316,22.0349766 L22.2877989,22.1404913 L22.2071466,22.246006 L22.1264944,22.3544516 L22.0487226,22.4599663 L21.9709507,22.565481 L21.8989398,22.6739266 L21.8240484,22.7794413 L21.7549179,22.8878869 L21.6857874,22.9934016 L21.6166568,23.0989163 L21.5504068,23.2073619 L21.4870371,23.3128766 L21.4236675,23.4183913 L21.3631783,23.5268369 L21.3026891,23.6323516 C21.282526,23.6675232 21.262363,23.7026947 21.2450803,23.7378663 L21.1874716,23.8463119 C21.1673085,23.8814835 21.1500259,23.916655 21.1327432,23.9518266 C21.1154606,23.9869981 21.0952976,24.0221697 21.0780149,24.0573413 C21.0607323,24.0925128 21.0434497,24.1306153 21.0232866,24.1657869 L20.9714387,24.2713016 C20.9570365,24.3064731 20.9397539,24.3416447 20.9224713,24.3797472 L20.8735038,24.4852619 L20.8274168,24.5907766 C20.8101342,24.6259481 20.795732,24.6640506 20.7813298,24.6992222 C20.7669276,24.7343938 20.749645,24.7695653 20.7352428,24.8047369 L20.6920362,24.9102515 L20.6488297,25.0186972 C20.6344275,25.0538687 20.6200253,25.0890403 20.6085035,25.1242119 L20.5681774,25.2297265 C20.5681774,25.2678291 20.5422534,25.3030006 20.5278513,25.3381722 C20.5134491,25.3733437 20.5048077,25.4085153 20.4904056,25.4436869 L20.4558403,25.5521325 L20.4183946,25.6576472 C20.4183946,25.6928187 20.3982315,25.7279903 20.3867098,25.7631618 L20.3521445,25.8716075 C20.3521445,25.906779 20.3319815,25.9419506 20.3204597,25.9771222 C20.308938,26.0122937 20.3002966,26.0474653 20.2916553,26.0826368 C20.283014,26.1178084 20.2714923,26.1529799 20.2599705,26.1910825 L20.2340466,26.2965971 C20.2340466,26.3317687 20.2138835,26.3669403 20.2052422,26.4021118 L20.1793182,26.5105575 L20.1533943,26.6160721 C20.1533943,26.6512437 20.1389921,26.6864152 20.1303508,26.7215868 C20.1217095,26.7567584 20.1130682,26.7948609 20.1073073,26.8300324 C20.1015464,26.865204 20.0929051,26.9003756 20.0842638,26.9355471 C20.0756225,26.9707187 20.0842638,27.0058902 20.0641007,27.0439928 C20.0439377,27.0820953 20.0641007,27.1143359 20.0439377,27.1495074 L20.026655,27.2550221 C20.026655,27.2901937 20.026655,27.3253652 20.006492,27.3634677 C19.9863289,27.4015703 20.006492,27.4338109 19.9920898,27.4689824 C19.9776876,27.504154 19.9920898,27.5393255 19.9920898,27.5744971 L19.9748071,27.6829427 C19.9748071,27.7181143 19.9748071,27.7532859 19.9748071,27.7884574 C19.9748071,27.823629 19.9748071,27.8588005 19.9748071,27.8939721 C19.9748071,27.9291436 19.9748071,27.9672462 19.9748071,28.0024177 L19.9748071,28.1079324 C19.9748071,28.143104 19.9748071,28.1782755 19.9748071,28.2134471 L19.9748071,28.3218927 C19.9748071,28.3570643 19.9748071,28.3922358 19.9748071,28.4274074 C19.9748071,28.4625789 19.9748071,28.4977505 19.9748071,28.535853 C19.9748071,28.5739555 19.9748071,28.6061961 19.9748071,28.6413677 C19.9748071,28.6765393 19.9748071,28.7117108 19.9748071,28.7468824 C19.9748071,28.7820539 19.9748071,28.8172255 19.9748071,28.855328 C19.9748071,28.8934305 19.9748071,28.9256711 19.9748071,28.9608427 L19.9748071,29.0663574 C19.9748071,29.1015289 19.9748071,29.1396314 19.9748071,29.174803 L19.9748071,29.2803177 C19.9748071,29.3154892 19.9748071,29.3506608 19.9748071,29.3858324 C19.9748071,29.4210039 19.9748071,29.4591064 19.9748071,29.494278 C19.9748071,29.5294496 19.9748071,29.5646211 19.9748071,29.5997927 C19.9748071,29.6349642 19.9748071,29.6701358 19.9748071,29.7082383 C19.9748071,29.7463408 19.9748071,29.7785814 19.9748071,29.813753 L19.9748071,29.9192677 L19.9748071,30.0277133 C19.9719614,30.0628253 19.9719614,30.098116 19.9748071,30.133228 L19.9748071,30.2387426 C19.9748071,30.2739142 19.9748071,30.3120167 19.9748071,30.3471883 C19.9748071,30.3823598 19.9748071,30.4175314 19.9748071,30.452703 C19.9748071,30.4878745 19.9748071,30.5230461 19.9748071,30.5582176 C19.9748071,30.5933892 19.9748071,30.6314917 19.9748071,30.6666633 L19.9920898,30.7721779 C19.9920898,30.8073495 19.9920898,30.8425211 19.9920898,30.8776926 L20.0093724,30.9861383 C20.0093724,31.0213098 20.0093724,31.0564814 20.0295355,31.0916529 L20.0468181,31.2000986 C20.0468181,31.2352701 20.0468181,31.2704417 20.0669812,31.3056133 C20.0871442,31.3407848 20.0669812,31.3759564 20.0900247,31.4111279 C20.1130682,31.4462995 20.1044269,31.484402 20.1130682,31.5195736 C20.1217095,31.5547451 20.1130682,31.5899167 20.1361117,31.6250882 C20.1591552,31.6602598 20.1505139,31.6954314 20.1591552,31.7306029 L20.1850791,31.8390486 L20.2110031,31.9445632 C20.2110031,31.9797348 20.2282857,32.0149063 20.2398074,32.0500779 C20.2513292,32.0852495 20.2570901,32.123352 20.2686118,32.1585235 C20.2801336,32.1936951 20.2858945,32.2288667 20.2974162,32.2640382 L20.3146988,32.3255884 C20.0669812,32.3431742 19.8192635,32.36076 19.5686654,32.3695529 C19.3180673,32.3783458 19.1510019,32.3695529 18.9407299,32.3695529 C18.7304579,32.3695529 18.5345881,32.3695529 18.3387183,32.3695529 C17.9268157,32.3519671 17.5293152,32.3138646 17.1375756,32.2640382 C16.8984993,32.2347286 16.6623034,32.1966261 16.423227,32.1585235 L15.8471394,32.0500779 L15.3084975,31.9445632 L14.7928991,31.8390486 L14.2830615,31.7306029 L13.7962675,31.6309502 L13.6003977,31.7306029 L13.3930062,31.8390486 L13.1827342,31.9445632 L12.9753426,32.0500779 L12.7650707,32.1585235 L12.5576791,32.2640382 L12.3474071,32.3695529 L12.1400156,32.4779985 L11.9297436,32.5835132 L11.7194716,32.6919588 L11.5120801,32.7974735 L11.3018081,32.9029882 L11.0944166,33.0114338 L10.8841446,33.1169485 L10.6767531,33.2224632 L10.4664811,33.3309088 L10.2590895,33.4364235 L10.0488176,33.5419382 L9.84142602,33.6503838 L9.63115404,33.7558985 L9.4237625,33.8614132 L9.21349052,33.9698588 L9.00609898,34.0753735 L8.795827,34.1838191 L8.64892466,34.2570932 L8.67196816,34.1838191 L8.70653342,34.0753735 L8.74109868,33.9698588 L8.77566393,33.8614132 L8.81310963,33.7558985 L8.84767488,33.6503838 L8.88224014,33.5419382 L8.9168054,33.4364235 L8.95137065,33.3309088 L8.98593591,33.2224632 L9.02050117,33.1169485 L9.05506642,33.0114338 L9.08963168,32.9029882 L9.12419694,32.7974735 L9.1587622,32.6919588 L9.19620789,32.5835132 L9.23077315,32.4779985 L9.2653384,32.3695529 L9.29990366,32.2640382 L9.33446892,32.1585235 L9.36903417,32.0500779 L9.40359943,31.9445632 L9.43816469,31.8390486 L9.47272994,31.7306029 L9.5072952,31.6250882 L9.54186046,31.5195736 L9.57930615,31.4111279 L9.61387141,31.3056133 L9.64843667,31.2000986 L9.68300192,31.0916529 L9.71756718,30.9861383 L9.75213244,30.8776926 L9.78669769,30.7721779 L9.82126295,30.6666633 L9.85582821,30.5582176 L9.89039346,30.452703 L9.92495872,30.3471883 L9.96240442,30.2387426 L9.99696967,30.133228 L10.0315349,30.0277133 L10.0661002,29.9192677 L10.1006654,29.813753 L10.1208285,29.7522028 L10.0574589,29.7082383 L9.91055653,29.5997927 L9.76653463,29.494278 L9.62539316,29.3858324 L9.48713214,29.2803177 L9.34887111,29.174803 L9.21061008,29.0810122 L9.07810993,28.9754975 L8.94849022,28.8699828 L8.82175094,28.7615372 L8.6978921,28.6560225 L8.57403327,28.5505078 L8.45593531,28.4420622 L8.33783735,28.3365475 L8.22261982,28.2281019 L8.1074023,28.1225872 L7.99794565,28.0170725 L7.88848901,27.9086269 L7.7819128,27.8031122 L7.67821703,27.6975976 L7.57452126,27.5891519 L7.47370592,27.4836372 L7.37289059,27.3781226 L7.27783614,27.2696769 L7.18278168,27.1641622 L7.09060766,27.0586476 L6.99843364,26.9502019 L6.90914006,26.8446873 C6.88033568,26.8095157 6.84865086,26.7743441 6.81984648,26.7362416 L6.73631378,26.6307269 L6.64990064,26.5252123 C6.62397669,26.4900407 6.59517231,26.4548692 6.56924837,26.4167666 L6.48859611,26.311252 L6.40794384,26.2057373 L6.33305245,26.0972916 L6.25528062,25.991777 L6.18326967,25.8862623 C6.15734573,25.8510907 6.13430222,25.8129882 6.11125872,25.7778167 L6.03924777,25.672302 L5.97011725,25.5667873 L5.90386718,25.4583417 C5.88082367,25.4231701 5.85778017,25.3879986 5.8376171,25.352827 L5.77136703,25.2443814 L5.71087783,25.1388667 C5.68783432,25.1036951 5.66767126,25.0685236 5.64750819,25.033352 L5.58989943,24.9249064 L5.52941023,24.8193917 L5.4746819,24.713877 L5.41707314,24.6054314 L5.36522526,24.4999167 C5.34506219,24.4647451 5.32777956,24.4295736 5.31049693,24.394402 L5.25864905,24.2859564 C5.25864905,24.2507848 5.22696423,24.2156133 5.2096816,24.1804417 C5.19239897,24.1452702 5.17799678,24.1100986 5.16071416,24.0719961 L5.11462715,23.9664814 C5.09734452,23.9313098 5.08294233,23.8961383 5.06854014,23.8609667 L5.02533357,23.7525211 C5.01093138,23.7173495 4.99364875,23.682178 4.982127,23.6470064 L4.93892042,23.5414917 C4.93892042,23.5063202 4.91299648,23.4682177 4.89859429,23.4330461 L4.85826816,23.3275314 C4.85826816,23.2923599 4.83522465,23.2571883 4.82082246,23.2220167 C4.80642027,23.1868452 4.79777896,23.1487427 4.78337677,23.1135711 L4.74881151,23.0080564 L4.71424625,22.9025418 C4.71424625,22.8644392 4.69408319,22.8292677 4.68256144,22.7940961 C4.67103968,22.7589246 4.66239837,22.723753 4.65087662,22.6885814 C4.63935486,22.6534099 4.63071355,22.6182383 4.6191918,22.5801358 C4.60767005,22.5420333 4.60190917,22.5097927 4.59038742,22.4746211 C4.57886567,22.4394496 4.57310479,22.404278 4.56158304,22.3691065 L4.53565909,22.2606608 L4.50973515,22.1551461 C4.50973515,22.1199746 4.49245252,22.084803 4.48669165,22.0496315 C4.48093077,22.0144599 4.46940902,21.9763574 4.46364814,21.9411858 C4.45788727,21.9060143 4.44636551,21.8708427 4.44060464,21.8356712 C4.43484376,21.8004996 4.44060464,21.765328 4.41756113,21.7301565 L4.40027851,21.6217108 C4.40027851,21.5865393 4.40027851,21.5513677 4.38011544,21.5161962 L4.36283281,21.4106815 L4.34555018,21.3022358 C4.34555018,21.2670643 4.34555018,21.2318927 4.33114799,21.1967212 C4.3167458,21.1615496 4.33114799,21.1263781 4.33114799,21.0882755 C4.33114799,21.050173 4.33114799,21.0179324 4.3167458,20.9827609 C4.30234361,20.9475893 4.3167458,20.9124177 4.3167458,20.8772462 C4.3167458,20.8420746 4.3167458,20.8069031 4.3167458,20.7688005 C4.3167458,20.730698 4.3167458,20.6984574 4.3167458,20.6632859 L4.3167458,20.5577712 L4.3167458,20.4493256 C4.3167458,20.414154 4.3167458,20.3789824 4.3167458,20.3438109 C4.3167458,20.3086393 4.3167458,20.2734678 4.3167458,20.2382962 C4.3167458,20.2031247 4.3167458,20.1650221 4.3167458,20.1298506 C4.3167458,20.094679 4.3167458,20.0595075 4.3167458,20.0243359 C4.3167458,19.9891643 4.3167458,19.9539928 4.3167458,19.9158903 L4.3167458,19.8103756 C4.3167458,19.775204 4.3167458,19.7400325 4.3167458,19.7048609 L4.3167458,19.5964153 C4.3167458,19.5612437 4.3167458,19.5260722 4.3167458,19.4909006 C4.3167458,19.455729 4.3167458,19.4205575 4.3167458,19.3853859 L4.3167458,19.2769403 C4.3167458,19.2417687 4.3167458,19.2065972 4.3167458,19.1714256 C4.3167458,19.136254 4.3167458,19.1010825 4.3167458,19.0659109 C4.3167458,19.0307394 4.3167458,18.9926368 4.3167458,18.9574653 C4.3167458,18.9222937 4.3167458,18.8871222 4.3167458,18.8519506 L4.3167458,18.7464359 L4.3167458,18.6379903 C4.3167458,18.6028187 4.3167458,18.5676472 4.3167458,18.5324756 L4.3167458,18.42403 C4.3167458,18.3888584 4.3167458,18.3536869 4.3167458,18.3185153 C4.3167458,18.2833438 4.3167458,18.2481722 4.33114799,18.2130006 C4.34555018,18.1778291 4.33114799,18.1397266 4.33114799,18.104555 C4.33114799,18.0693834 4.33114799,18.0342119 4.34555018,17.9990403 L4.36283281,17.8935256 L4.38011544,17.78508 L4.39739807,17.6795653 C4.39739807,17.6443938 4.39739807,17.6092222 4.41756113,17.5740507 C4.4377242,17.5388791 4.41756113,17.5007766 4.4377242,17.465605 C4.45788727,17.4304335 4.45212639,17.3952619 4.45788727,17.3600903 C4.46364814,17.3249188 4.47516989,17.2897472 4.48093077,17.2545757 L4.50685471,17.14613 C4.50685471,17.1109585 4.50685471,17.0757869 4.52989822,17.0406154 L4.55582216,16.9321697 L4.5817461,16.826655 C4.5817461,16.7914835 4.60190917,16.7563119 4.61055048,16.7211404 L4.63935486,16.6126947 C4.63935486,16.5775232 4.65951793,16.5423516 4.67103968,16.5071801 C4.68256144,16.4720085 4.69120275,16.4368369 4.7027245,16.4016654 C4.71424625,16.3664938 4.72288757,16.3283913 4.73440932,16.2932197 L4.76897458,16.1877051 L4.80353983,16.0821904 C4.80353983,16.0440879 4.82658334,16.0089163 4.84098553,15.9737448 L4.87555079,15.8682301 C4.88995298,15.8330585 4.90147473,15.797887 4.91587692,15.7597844 C4.93027911,15.7216819 4.94180086,15.6894413 4.95620305,15.6542698 L4.99364875,15.5487551 L5.03685532,15.4403095 L5.08006189,15.3347948 L5.12326846,15.2292801 C5.14055109,15.1911776 5.15495328,15.156006 5.17223591,15.1208345 C5.18951854,15.0856629 5.20104029,15.0504913 5.21832292,15.0153198 L5.26440993,14.9098051 L5.31625781,14.8013595 C5.33354044,14.7661879 5.35082307,14.7310164 5.36522526,14.6958448 L5.41995358,14.5903301 L5.47180147,14.4818845 C5.49196453,14.4467129 5.50924716,14.4115414 5.52652979,14.3763698 L5.58413855,14.2679242 L5.64174731,14.1624095 L5.69935607,14.0568948 C5.71951914,14.0217233 5.74256265,13.9865517 5.76272571,13.9484492 L5.82321491,13.8429345 L5.88658455,13.7374198 L5.95283462,13.6289742 C5.97299769,13.5938026 5.9960412,13.5586311 6.0190847,13.5234595 C6.0421282,13.488288 6.06229127,13.4531164 6.08533478,13.4179448 L6.15446529,13.3094992 L6.22647624,13.2039845 L6.30136763,13.0984699 C6.32441114,13.0603673 6.34745464,13.0251958 6.37337858,12.9900242 L6.45115041,12.8845095 L6.52892224,12.7760639 L6.60669407,12.6705492 L6.69022677,12.5650346 L6.77087904,12.4565889 L6.85729218,12.3510742 L6.94370532,12.2455596 C6.9725097,12.207457 7.00419452,12.1722855 7.0329989,12.1371139 L7.12229248,12.0315992 L7.21734694,11.9260846 C7.24615132,11.8879821 7.28071657,11.8528105 7.31240139,11.8176389 L7.40745585,11.7121243 L7.50827118,11.6036786 L7.60620608,11.4981639 L7.71278228,11.3926493 L7.81647806,11.2842036 L7.9259347,11.178689 L8.03539135,11.0731743 L8.15060887,10.9647286 L8.26582639,10.859214 L8.38392435,10.7536993 L8.50490275,10.6452537 L8.62876159,10.539739 L8.7583813,10.4342243 L8.88800102,10.3257787 L9.02050117,10.220264 L9.1587622,10.1118184 L9.29990366,10.0063037 L9.44392556,9.900789 L9.59082791,9.79234337 L9.74349112,9.68682869 L9.89903478,9.58131401 L10.0603393,9.47286838 L10.2274047,9.3673537 L10.3973506,9.26183903 L10.5730573,9.15339339 L10.7545249,9.04787871 L10.9417534,8.94236404 L11.1376231,8.8339184 L11.3363734,8.72840372 L11.5466454,8.61995809 L11.7626782,8.51444341 L11.9873524,8.40892874 L12.2235483,8.3004831 L12.471266,8.19496842 L12.7305054,8.08945375 L13.0185492,7.98100811 L13.306593,7.87549343 C13.4074083,7.83739091 13.5111041,7.80221935 13.6119195,7.76997876 L13.9431698,7.66153312 L14.2974637,7.55601844 L14.6892033,7.44757281 L15.1241494,7.34205813 C15.285454,7.30395561 15.4496389,7.26878405 15.6138239,7.23654346 C15.7780089,7.20430286 16.0084439,7.16033841 16.2071942,7.12809782 C16.4577923,7.08706433 16.7141513,7.05189277 16.9705102,7.02258314 L16.9445863,7.01085929 Z M29.2498177,24.1335463 C28.4614278,24.1690257 27.8401944,24.8297309 27.8401944,25.632734 C27.8401944,26.4357371 28.4614278,27.0964423 29.2498177,27.1319217 C30.3645473,27.1319217 31.0932981,26.390388 31.0932981,25.6341995 C31.0932981,24.878011 30.3645473,24.1335463 29.2498177,24.1335463 L29.2498177,24.1335463 Z M37.3496096,24.1335463 C36.5612196,24.1690257 35.9399862,24.8297309 35.9399862,25.632734 C35.9399862,26.4357371 36.5612196,27.0964423 37.3496096,27.1319217 C38.4528174,27.1319217 39.1930899,26.390388 39.1930899,25.6341995 C39.1930899,24.878011 38.4528174,24.1335463 37.3496096,24.1335463 L37.3496096,24.1335463 Z M14.1563222,13.2538109 C13.0531145,13.2538109 11.9383849,13.9953446 11.9383849,15.1237654 C11.9383849,16.2521863 13.0531145,16.9995819 14.1563222,16.9995819 C15.1728575,16.9995819 15.9969222,16.1610625 15.9969222,15.1266964 C15.9969222,14.0923303 15.1728575,13.2538109 14.1563222,13.2538109 L14.1563222,13.2538109 Z M24.4769318,17.0113057 C25.4934671,17.0113057 26.3175318,16.1727863 26.3175318,15.1384202 C26.3175318,14.1040542 25.4934671,13.2655348 24.4769318,13.2655348 C23.3708436,13.2655348 22.2647554,14.0070684 22.2647554,15.1354893 C22.2647554,16.2639101 23.3708436,17.0113057 24.4769318,17.0113057 L24.4769318,17.0113057 Z M24.0563879,21.6715372 L24.1514423,21.5806774 L24.2493772,21.4927485 C24.2810621,21.4605079 24.3156273,21.4311982 24.3501926,21.4018886 L24.4510079,21.3110287 L24.5575841,21.2201689 L24.6641603,21.129309 L24.7764974,21.0384492 L24.8888345,20.9475893 L25.0069325,20.8567294 L25.1250304,20.7688005 L25.2460088,20.6779407 L25.3727481,20.5870808 L25.5023678,20.496221 L25.634868,20.4053611 L25.7702485,20.3145013 L25.91139,20.2236414 L26.0525315,20.1327815 L26.2051947,20.0419217 L26.3578579,19.9539928 L26.516282,19.8631329 L26.680467,19.7722731 L26.8504128,19.6814132 L27.0261195,19.5905533 L27.2104676,19.4996935 L27.4034569,19.4088336 L27.6022072,19.3179738 L27.8124791,19.2271139 L28.0313924,19.139185 L28.2618275,19.0483251 L28.5066647,18.9574653 L28.7687846,18.8666054 L29.0568284,18.7757456 L29.3448722,18.6848857 L29.6761226,18.5940259 L30.0448186,18.503166 L30.4596017,18.4152371 C30.6266671,18.3800655 30.796613,18.3507559 30.9636784,18.3243772 C31.1797112,18.2892057 31.3957441,18.2569651 31.6146574,18.2335174 C32.1673886,18.1690551 32.7232039,18.1357866 33.2795506,18.1338646 L33.3573224,18.1338646 C33.8878048,18.1360341 34.4177237,18.1693068 34.9444438,18.2335174 C35.1518353,18.2569651 35.3621073,18.2892057 35.5694989,18.3243772 C35.7308034,18.3507559 35.8949884,18.3800655 36.0562929,18.4152371 C36.2175974,18.4504087 36.3270541,18.4709254 36.4595542,18.503166 L36.819609,18.5940259 L37.1450985,18.6848857 L37.4331423,18.7757456 L37.7067839,18.8666054 L37.9631429,18.9574653 L38.2050997,19.0483251 L38.4326543,19.139185 L38.6515676,19.2271139 L38.8589591,19.3179738 L39.0577094,19.4088336 L39.2478183,19.4996935 L39.4321663,19.5905533 L39.607873,19.6814132 C39.6654818,19.7107228 39.7230905,19.7400325 39.7778189,19.7722731 L39.9448843,19.8631329 L40.1033084,19.9539928 L40.2559716,20.0419217 L40.4086348,20.1327815 L40.5526567,20.2236414 L40.6937982,20.3145013 L40.8320592,20.4053611 L40.9645594,20.496221 L41.0941791,20.5870808 C41.1373856,20.6163905 41.1805922,20.6457001 41.2209183,20.6779407 L41.3476576,20.7688005 L41.4657556,20.8567294 L41.5838535,20.9475893 L41.6990711,21.0384492 L41.8114081,21.129309 L41.9208648,21.2201689 L42.0303214,21.3110287 L42.1340172,21.4018886 L42.237713,21.4927485 L42.3356479,21.5806774 L42.4364632,21.6715372 L42.5315177,21.7623971 L42.6236917,21.8532569 L42.7158657,21.9441168 L42.8080397,22.0349766 L42.8944529,22.1258365 L42.980866,22.2166964 L43.0672791,22.3075562 L43.1479314,22.3954851 L43.2285837,22.486345 L43.3092359,22.5772048 L43.3870078,22.6680647 L43.4618992,22.7589246 L43.5367906,22.8497844 C43.5598341,22.8790941 43.585758,22.9084037 43.6088015,22.9406443 C43.6343657,22.9696152 43.658403,22.9999444 43.6808125,23.0315041 L43.749943,23.122364 L43.8190735,23.2102929 L43.8853236,23.3011528 L43.9515736,23.3920126 C43.9746171,23.4213222 43.9947802,23.4535628 44.0149433,23.4828725 C44.0351063,23.5121821 44.0581498,23.5444227 44.0783129,23.5737323 L44.1388021,23.6645922 L44.1992913,23.755452 L44.2597805,23.8463119 L44.3173893,23.9342408 C44.3346719,23.9664814 44.354835,23.995791 44.3721176,24.0251007 L44.4268459,24.1159605 L44.4815742,24.2068204 L44.5334221,24.2976802 L44.58527,24.3885401 C44.6179117,24.4491055 44.6505475,24.5096732 44.6831924,24.5702464 L44.7321598,24.6611062 L44.7782469,24.7490351 L44.8243339,24.839895 L44.8675404,24.9307548 C44.8819426,24.9629954 44.8992253,24.9923051 44.9136274,25.0216147 C44.9280296,25.0509243 44.9395514,25.0831649 44.9539536,25.1124746 C44.9683558,25.1417842 44.9798775,25.1740248 44.9942797,25.2033344 C45.0094454,25.232798 45.0229103,25.2631361 45.0346058,25.2941943 C45.0488156,25.3237132 45.0613188,25.3540515 45.0720515,25.3850541 C45.0720515,25.4143638 45.0979755,25.4436734 45.1123777,25.475914 L45.1469429,25.5638429 L45.1843886,25.6547028 L45.2189539,25.7455626 C45.2189539,25.7748722 45.2419974,25.8071128 45.2506387,25.8364225 L45.285204,25.9272823 C45.285204,25.956592 45.305367,25.9888326 45.3168888,26.0181422 C45.3284105,26.0474518 45.3370518,26.0767615 45.3456932,26.109002 C45.3570131,26.1386965 45.3666307,26.169034 45.3744975,26.1998619 L45.4061824,26.2877908 L45.4321063,26.3786507 L45.4580302,26.4695105 L45.4839542,26.5603704 L45.5098781,26.6512302 C45.5098781,26.6805399 45.5242803,26.7127805 45.5329216,26.7420901 C45.5415629,26.7713997 45.5329216,26.8007094 45.5559651,26.83295 C45.5790086,26.8651906 45.5703673,26.8915692 45.5761282,26.9238098 C45.5845224,26.9536867 45.5912541,26.9840215 45.5962913,27.0146697 C45.5962913,27.0439793 45.5962913,27.0732889 45.6164543,27.1025986 C45.6366174,27.1319082 45.6308565,27.1641488 45.6366174,27.1934584 L45.6539,27.2843183 L45.6711827,27.3751782 C45.6711827,27.4044878 45.6711827,27.4367284 45.6711827,27.466038 L45.6884653,27.5568979 C45.6884653,27.5862075 45.6884653,27.6155171 45.6884653,27.6477577 C45.6884653,27.6799983 45.6884653,27.706377 45.6884653,27.7386176 C45.6900518,27.7688827 45.6900518,27.7992123 45.6884653,27.8294774 C45.6884653,27.8587871 45.6884653,27.8880967 45.6884653,27.9174063 L45.6884653,28.0082662 L45.6884653,28.0991261 C45.6884653,28.1313667 45.6884653,28.1606763 45.6884653,28.1899859 L45.6884653,28.2808458 C45.6884653,28.3101554 45.6884653,28.342396 45.6884653,28.3717056 L45.6884653,28.4625655 C45.6884653,28.4918751 45.6884653,28.5211848 45.6884653,28.5534254 C45.6884653,28.585666 45.6884653,28.6120446 45.6884653,28.6442852 C45.6884653,28.6765258 45.6884653,28.7029045 45.6884653,28.7322141 L45.6884653,28.823074 C45.6884653,28.8553146 45.6884653,28.8846242 45.6884653,28.9139338 L45.6884653,29.1865134 C45.6884653,29.215823 45.6884653,29.2451327 45.6884653,29.2773733 C45.6884653,29.3096139 45.6884653,29.3359925 45.6884653,29.3682331 C45.6884653,29.4004737 45.6884653,29.4268524 45.6884653,29.456162 C45.6884653,29.4854717 45.6884653,29.5177123 45.6884653,29.5470219 L45.6884653,29.6378817 C45.6900041,29.6681481 45.6900041,29.6984752 45.6884653,29.7287416 L45.6884653,29.8196015 C45.6884653,29.8489111 45.6884653,29.8811517 45.6884653,29.9104613 C45.6884653,29.939771 45.6884653,29.9720115 45.6884653,30.0013212 C45.6884653,30.0306308 45.6884653,30.0599404 45.6884653,30.092181 C45.6884653,30.1244216 45.6884653,30.1508003 45.6740631,30.1830409 C45.6596609,30.2152815 45.6740631,30.2416602 45.6740631,30.2709698 L45.6567805,30.3618297 C45.6567805,30.3940702 45.6567805,30.4233799 45.6567805,30.4526895 C45.6517433,30.4833377 45.6450116,30.5136725 45.6366174,30.5435494 L45.6193348,30.6344092 C45.6193348,30.6637189 45.6193348,30.6959595 45.5991717,30.7252691 C45.5790086,30.7545787 45.5991717,30.7838884 45.5790086,30.8161289 C45.5588456,30.8483695 45.5646064,30.8747482 45.5588456,30.9069888 C45.5494737,30.9368052 45.54178,30.967141 45.5358021,30.9978487 L45.5098781,31.0857776 C45.5098781,31.1180182 45.5098781,31.1473278 45.4868346,31.1766374 L45.4609107,31.2674973 C45.4609107,31.2997379 45.4407476,31.3290475 45.4321063,31.3583571 L45.4061824,31.449217 C45.4061824,31.4785266 45.3860193,31.5107672 45.3744975,31.5400769 C45.3629758,31.5693865 45.3543345,31.5986961 45.3456932,31.6309367 C45.3370518,31.6631773 45.3255301,31.689556 45.3140083,31.7217966 C45.3017244,31.7514325 45.2911449,31.7817703 45.2823235,31.8126564 L45.2477583,31.9005853 L45.213193,31.9914452 C45.2024603,32.0224478 45.1899571,32.0527861 45.1757473,32.0823051 L45.141182,32.1731649 C45.1267799,32.2024745 45.1152581,32.2347151 45.1008559,32.2640248 L45.0634102,32.3548846 C45.0482445,32.3843482 45.0347796,32.4146863 45.0230841,32.4457445 L44.9798775,32.5366043 L44.9395514,32.6245332 C44.9259341,32.6557039 44.9105458,32.6860418 44.8934644,32.7153931 L44.8502578,32.806253 C44.8358556,32.8384936 44.818573,32.8678032 44.8041708,32.8971128 L44.7580838,32.9879727 L44.7091163,33.0788325 L44.6601489,33.1696924 L44.608301,33.2605523 L44.5564531,33.3514121 L44.5046052,33.439341 C44.4873226,33.4715816 44.4671595,33.5008912 44.4498769,33.5302009 C44.4333358,33.5615153 44.4150638,33.5918506 44.3951486,33.6210607 C44.377866,33.6533013 44.3577029,33.682611 44.3404203,33.7119206 L44.2828115,33.8027804 L44.2223223,33.8936403 L44.1618331,33.9845002 L44.1013439,34.07536 L44.0408547,34.1662199 L43.9746046,34.2541488 C43.9544416,34.2863894 43.9313981,34.315699 43.911235,34.3450086 L43.8449849,34.4358685 L43.7787348,34.5267284 L43.7096043,34.6175882 L43.6404738,34.7084481 C43.6174303,34.7377577 43.5915064,34.7670673 43.5684629,34.7993079 C43.5454194,34.8315485 43.5194954,34.8579272 43.4964519,34.8901678 L43.4215605,34.9780967 C43.3716297,35.038656 43.321712,35.0992388 43.271789,35.1598064 L43.1940171,35.2506663 L43.1162453,35.3415262 L43.035593,35.432386 L42.9549408,35.5232459 C42.9261364,35.5525555 42.897332,35.5818651 42.8714081,35.6141057 C42.8454841,35.6463463 42.8137993,35.672725 42.7878754,35.7049656 L42.7014622,35.7928945 L42.6150491,35.8837543 L42.5257555,35.9746142 C42.4969511,36.0068548 42.4652663,36.0361644 42.4364619,36.0654741 L42.3442879,36.1563339 L42.2521139,36.2471938 L42.1570594,36.3380536 L42.062005,36.4289135 L41.9640701,36.5197734 L41.8661352,36.6077023 L41.7653199,36.6985621 L41.6645045,36.789422 L41.5608088,36.8802818 L41.4542325,36.9711417 L41.3476563,37.0620016 L41.2410801,37.1528614 C41.2036344,37.182171 41.1661887,37.2114807 41.1316235,37.2437213 L41.0192864,37.3345811 L40.9040689,37.42251 L40.7888514,37.5133699 L40.6736338,37.6042297 L40.6333077,37.6364703 L40.6505903,37.6950896 L40.6765143,37.7859495 L40.7024382,37.8768093 L40.7312426,37.9676692 L40.7571665,38.058529 L40.7830905,38.1464579 L40.8118949,38.2373178 L40.8378188,38.3281777 L40.8637427,38.4190375 L40.8896667,38.5098974 L40.9184711,38.6007572 L40.944395,38.6916171 L40.9703189,38.782477 L40.9991233,38.8733368 L41.0250473,38.9612657 L41.0509712,39.0521256 L41.0768952,39.1429854 L41.1056995,39.2338453 L41.1316235,39.3247051 L41.1575474,39.415565 L41.1863518,39.5064249 L41.2122757,39.5972847 L41.2381997,39.6852136 L41.2670041,39.7760735 L41.292928,39.8669333 L41.318852,39.9577932 L41.3447759,40.0486531 L41.3735803,40.1395129 L41.3995042,40.2303728 L41.4254282,40.3212326 L41.4542325,40.4120925 L41.4801565,40.5000214 L41.5060804,40.5908812 L41.5320044,40.6817411 L41.5608088,40.772601 L41.5867327,40.8634608 L41.6126566,40.9543207 L41.641461,41.0451805 L41.667385,41.1360404 L41.6933089,41.2269003 L41.7221133,41.3148292 L41.7393959,41.3793103 L41.6241784,41.3148292 L41.4628739,41.2269003 L41.2986889,41.1360404 L41.1373844,41.0451805 L40.9731994,40.9543207 L40.8118949,40.8634608 L40.6505903,40.772601 L40.4864054,40.6817411 L40.3251008,40.5908812 L40.1609159,40.5000214 L39.9996113,40.4120925 L39.8383068,40.3212326 L39.6741218,40.2303728 L39.5128173,40.1395129 L39.3515128,40.0486531 L39.1873278,39.9577932 L39.0260233,39.8669333 L38.8618383,39.7760735 L38.7005338,39.6852136 L38.5392292,39.5972847 L38.3750442,39.5064249 L38.2137397,39.415565 L38.0495547,39.3247051 L37.8882502,39.2338453 L37.7269457,39.1429854 L37.7010217,39.1429854 L37.643413,39.1429854 L37.2891191,39.2338453 L36.9261839,39.3247051 L36.5546074,39.415565 L36.1628678,39.5064249 L35.7423239,39.5972847 L35.2728124,39.6852136 C35.0827035,39.7203852 34.8925946,39.7496948 34.6967248,39.7760735 C34.388518,39.8200379 34.0831915,39.8522785 33.7749847,39.8669333 C33.6079192,39.8669333 33.4437343,39.8669333 33.2766689,39.8669333 C33.0577556,39.8669333 32.8417227,39.8669333 32.6285703,39.8669333 C32.2541134,39.8669333 31.8854173,39.8200379 31.5224821,39.7760735 C31.3064492,39.7526258 31.0961772,39.7203852 30.8830248,39.6852136 C30.7188399,39.6588349 30.5517745,39.6295253 30.3875895,39.5972847 L29.9728064,39.5064249 L29.6069908,39.415565 L29.2757404,39.3247051 L28.9876966,39.2338453 L28.6996528,39.1429854 L28.4404133,39.0521256 L28.1984566,38.9612657 L27.9680215,38.8733368 L27.7462278,38.782477 L27.5359558,38.6916171 L27.340086,38.6007572 L27.1499771,38.5098974 L26.9656291,38.4190375 L26.7899223,38.3281777 C26.7323136,38.298868 26.6747048,38.2695584 26.6199765,38.2373178 L26.4557915,38.1464579 L26.2973674,38.058529 L26.1447042,37.9676692 L25.992041,37.8768093 L25.8508995,37.7859495 L25.7097581,37.6950896 L25.5743775,37.6042297 L25.4418773,37.5133699 L25.3122576,37.42251 L25.1883988,37.3345811 L25.0645399,37.2437213 C25.0270942,37.2114807 24.9867681,37.182171 24.946442,37.1528614 L24.8312244,37.0620016 L24.7188874,36.9711417 L24.6065503,36.8802818 L24.4999741,36.789422 L24.3933979,36.6985621 L24.2925825,36.6077023 L24.1917672,36.5197734 L24.0938323,36.4289135 L23.9987778,36.3380536 L23.9066038,36.2471938 L23.8144298,36.1563339 L23.7251362,36.0654741 C23.6934514,36.0361644 23.664647,36.0068548 23.6358426,35.9746142 L23.5494295,35.8837543 L23.4658968,35.7928945 L23.3852445,35.7049656 L23.3045923,35.6141057 L23.2268204,35.5232459 L23.1490486,35.432386 L23.0741572,35.3415262 L23.0021463,35.2506663 C22.9765821,35.2216953 22.9525447,35.1913662 22.9301353,35.1598064 C22.9070918,35.1304968 22.8811679,35.1011872 22.8581244,35.0689466 L22.7889939,34.9780867 L22.7227438,34.8901578 L22.6564937,34.799298 C22.6363306,34.7670574 22.6132871,34.7377477 22.5931241,34.7084381 C22.572961,34.6791285 22.5499175,34.6468879 22.5297544,34.6175782 C22.5095914,34.5882686 22.4894283,34.556028 22.4663848,34.5267184 L22.4058956,34.4358585 L22.3482868,34.3449987 L22.2906781,34.2541388 L22.2330693,34.1662099 C22.1965836,34.1056003 22.1601266,34.045082 22.1236595,33.9845393 L22.0718116,33.8936795 L22.0199637,33.8028196 L21.9709963,33.7119597 L21.9220288,33.6210999 L21.8730614,33.53024 C21.8586592,33.5009304 21.8413766,33.4716208 21.8269744,33.4393802 C21.8125722,33.4071396 21.79817,33.3807609 21.7808874,33.3514513 L21.7376808,33.2605914 L21.6944742,33.1697316 L21.6512676,33.0788717 C21.6512676,33.0495621 21.6224633,33.0173215 21.6109415,32.9880118 C21.5994198,32.9587022 21.5850176,32.9264616 21.5706154,32.897152 C21.5562132,32.8678423 21.5446914,32.8385327 21.5302892,32.8062921 C21.5158871,32.7740515 21.5043653,32.7476729 21.4928435,32.7154323 L21.4582783,32.6245724 C21.4582783,32.5952628 21.4323543,32.5659531 21.4208326,32.5366435 L21.3862673,32.4457836 L21.3517021,32.3549238 C21.3517021,32.3256142 21.3286586,32.2933736 21.3200173,32.2640639 C21.3113759,32.2347543 21.2969738,32.2025137 21.2883324,32.1732041 C21.2796911,32.1438944 21.2681694,32.1116538 21.2566476,32.0823442 C21.2451259,32.0530346 21.2364846,32.0237249 21.2249628,31.9914843 L21.1990389,31.9006245 C21.1990389,31.8713149 21.1788758,31.8420052 21.1702345,31.8126956 C21.1615932,31.783386 21.1500714,31.7511454 21.1414301,31.7218357 C21.1327888,31.6925261 21.1414301,31.6602855 21.1183866,31.6309759 L21.0924627,31.540116 L21.0665387,31.4492562 C21.0665387,31.4199465 21.0665387,31.3877059 21.0463756,31.3583963 C21.0370037,31.3285799 21.0293101,31.2982441 21.0233321,31.2675364 C21.0233321,31.2382268 21.0233321,31.2089172 21.0002886,31.1766766 C20.9772451,31.144436 21.0002886,31.1180573 20.9801256,31.0858167 L20.9628429,30.9978878 C20.9628429,30.9656472 20.9628429,30.9363376 20.9426799,30.907028 L20.9253972,30.8161681 L20.9081146,30.7253082 C20.9081146,30.6959986 20.9081146,30.663758 20.8937124,30.6344484 C20.8793102,30.6051388 20.8937124,30.5728982 20.8937124,30.5435885 C20.8841357,30.483007 20.8745643,30.422439 20.8649632,30.361868 C20.8633767,30.3316029 20.8633767,30.3012732 20.8649632,30.2710081 C20.8649632,30.2416985 20.8649632,30.2123889 20.8649632,30.1830792 C20.8649632,30.1537696 20.8649632,30.121529 20.8649632,30.0922194 L20.8649632,30.0013595 L20.8649632,29.9104997 C20.8649632,29.88119 20.8649632,29.8489494 20.8649632,29.8196398 L20.8649632,29.7287799 C20.8649632,29.6994703 20.8649632,29.6701607 20.8649632,29.6379201 C20.8649632,29.6056795 20.8649632,29.5793008 20.8649632,29.5470602 C20.8649632,29.5148196 20.8649632,29.488441 20.8649632,29.4562004 L20.8649632,29.3682715 C20.8649632,29.3360309 20.8649632,29.3067212 20.8649632,29.2774116 L20.8649632,29.007763 L20.8649632,29.007763 L20.8649632,28.9169031 C20.8649632,28.8875935 20.8649632,28.8582839 20.8649632,28.8260433 L20.8649632,28.7351834 C20.8649632,28.7058738 20.8649632,28.6765642 20.8649632,28.6472545 C20.8649632,28.6179449 20.8649632,28.5857043 20.8649632,28.5563947 C20.8649632,28.527085 20.8649632,28.4948444 20.8649632,28.4655348 C20.8649632,28.4362252 20.8649632,28.4039846 20.8649632,28.3746749 L20.8649632,28.2838151 C20.8649632,28.2545055 20.8649632,28.2222649 20.8649632,28.1929552 L20.8649632,28.1020954 L20.8649632,28.0112355 L20.8649632,27.9203757 C20.8649632,27.891066 20.8649632,27.8617564 20.8649632,27.8324468 C20.8649632,27.8031371 20.8649632,27.7708965 20.8649632,27.7415869 C20.8649632,27.7122773 20.8649632,27.6800367 20.8649632,27.650727 C20.8649632,27.6214174 20.8649632,27.5891768 20.8793654,27.5598672 C20.8937676,27.5305575 20.8793654,27.498317 20.8793654,27.4690073 C20.8793654,27.4396977 20.8793654,27.4074571 20.8793654,27.3781475 L20.896648,27.2872876 L20.9139306,27.1964277 C20.9139306,27.1671181 20.9139306,27.1378085 20.9312133,27.1055679 L20.9484959,27.017639 C20.9484959,26.9853984 20.9628981,26.9560888 20.968659,26.9267791 C20.9744198,26.8974695 20.968659,26.8652289 20.988822,26.8359193 C20.9948,26.8052116 21.0024936,26.7748758 21.0118655,26.7450594 C21.0118655,26.7157498 21.0118655,26.6835092 21.0320286,26.6541996 C21.0521917,26.6248899 21.0320286,26.5926493 21.0550721,26.5633397 L21.080996,26.4724798 L21.10692,26.38162 C21.10692,26.3523103 21.10692,26.3230007 21.1299635,26.2907601 L21.1587679,26.2028312 C21.1779437,26.1422694 21.1971686,26.0817247 21.2163615,26.0211832 L21.2451658,25.9303234 C21.2451658,25.9010138 21.2653289,25.8687732 21.2768507,25.8394635 C21.2883724,25.8101539 21.2970137,25.7779133 21.3085355,25.7486037 L21.3431007,25.6577438 C21.3431007,25.6284342 21.3632638,25.5991245 21.3747856,25.566884 L21.4093508,25.4789551 C21.4093508,25.4467145 21.4352748,25.4174048 21.4467965,25.3880952 C21.4575292,25.3570926 21.4700324,25.3267543 21.4842422,25.2972353 C21.4842422,25.2649947 21.5101661,25.2356851 21.5216879,25.2063755 C21.5332096,25.1770658 21.5476118,25.1448253 21.562014,25.1155156 L21.5994597,25.0246558 L21.6426663,24.9337959 L21.6858729,24.842936 C21.6858729,24.8136264 21.7117968,24.7843168 21.726199,24.7520762 C21.7406012,24.7198356 21.7578838,24.6934569 21.772286,24.6641473 C21.7859033,24.6329767 21.8012916,24.6026388 21.818373,24.5732874 C21.8327752,24.5410468 21.8500578,24.5117372 21.86446,24.4824276 L21.9134275,24.3915677 L21.9623949,24.3007079 C21.9767971,24.2713982 21.9969602,24.2391576 22.0142428,24.209848 L22.0632103,24.1189881 L22.1179386,24.0281283 L22.1726669,23.9372684 L22.2245148,23.8493395 L22.2821235,23.7584797 L22.3397323,23.6676198 L22.4002215,23.5767599 L22.4607107,23.4859001 L22.5211999,23.3950402 C22.541363,23.3657306 22.5644065,23.336421 22.5845695,23.3041804 L22.6508196,23.2133205 L22.7170697,23.1253916 C22.7375173,23.0939048 22.7596334,23.0635734 22.7833198,23.0345317 L22.8524503,22.9436719 C22.8748597,22.9121121 22.8988971,22.881783 22.9244612,22.852812 C22.9475047,22.8235024 22.9705482,22.7912618 22.9964722,22.7619522 L23.0684831,22.6710923 L23.1433745,22.5802325 L23.2211464,22.4893726 L23.2989182,22.3985127 L23.3795705,22.3105838 C23.4054944,22.2783432 23.4342988,22.2490336 23.4631032,22.219724 C23.4919075,22.1904143 23.5178315,22.1581738 23.5466359,22.1288641 L23.633049,22.0380043 L23.7194621,21.9471444 L23.8087557,21.8562845 L23.9009297,21.7654247 L23.9959842,21.6745648 L24.0563879,21.6715372 Z" id="形状" fill="#FFFFFF"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const platformLogoTaoXianDa = (width = 60, height = 60) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 88 88" version="1.1" xmlns="http://www.w3.org/2000/svg">
    
    <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="编组-6备份-2">
            <circle id="椭圆形备份-3" stroke="#8ED028" stroke-width="4" cx="44" cy="44" r="42"></circle>
            <g id="pl_store_txd" transform="translate(19.000000, 19.000000)" fill-rule="nonzero">
                <polygon id="路径" fill="#8DD028" points="0 0 50 0 50 50 0 50"></polygon>
                <g id="编组-2" transform="translate(4.000000, 19.000000)" fill="#FFFFFF">
                    <path d="M22.6246778,2.47704378 C22.5476862,2.34657671 22.5107849,2.2628372 22.4556607,2.19436512 C22.2201302,1.90335877 21.9768549,1.6188295 21.7413244,1.32782315 C21.6731733,1.2472818 21.617278,1.15683412 21.5754963,1.05948661 C21.5550637,0.996677074 21.5625465,0.927947768 21.595997,0.871188384 C21.6663393,0.780841801 21.7462396,0.698614138 21.834261,0.625984304 C22.0046448,0.473772715 22.1850512,0.333127356 22.3499681,0.175363976 C22.5613533,-0.0272763766 22.7208034,-0.0342161147 22.9062211,0.189706102 C23.2178321,0.566302556 23.5203316,0.950764047 23.8287536,1.3301364 C23.9038574,1.42644033 23.9854487,1.51733773 24.07294,1.60217413 C24.2405904,1.75901221 24.4405863,1.71922438 24.5740688,1.53000085 C24.7075513,1.34077733 24.8656347,1.15988149 25.0095953,0.971120613 C25.2146026,0.70417202 25.4196098,0.437686077 25.6191502,0.166573641 C25.7517215,-0.0133969004 25.8168683,-0.052722083 25.9940856,0.0740437998 C26.3061522,0.298891315 26.6018182,0.547796588 26.893384,0.799940406 C26.9958877,0.888306404 26.9594419,1.02293732 26.8897395,1.11870571 C26.6296081,1.47633355 26.3580874,1.8256337 26.0952225,2.18279889 C26.0366068,2.27437375 25.9833642,2.36938203 25.9357725,2.46732815 C26.0437429,2.47287994 26.123468,2.48028233 26.203193,2.48028233 C26.4993146,2.48028233 26.7954361,2.47380524 27.0911021,2.48028233 C27.3371108,2.48490882 27.436881,2.58622899 27.4446257,2.83328367 C27.4534334,3.10254551 27.4567743,3.37180735 27.4546483,3.64106919 C27.4514593,3.98851874 27.3393887,4.0990919 27.0036324,4.0990919 C26.4419126,4.0990919 25.8801927,4.09585336 25.3180173,4.0990919 C25.0191623,4.0990919 25.0059508,4.11759787 25.0050396,4.41138012 C25.0050396,4.67370222 25.0050396,4.93602432 25.0050396,5.19788377 C25.0082286,5.43152162 25.0419409,5.46344441 25.271549,5.46251912 C25.7723741,5.46066852 26.2735029,5.45804684 26.7749354,5.45465408 L26.8888283,5.45465408 C27.2669528,5.45928057 27.2874535,5.48102508 27.2842645,5.86363598 C27.2842645,6.11809304 27.2842645,6.37255011 27.2842645,6.62700717 C27.2842645,6.99157475 27.2464521,7.04339146 26.8829059,7.05264444 C26.3817771,7.06467332 25.8806483,7.05542034 25.3795195,7.05264444 C25.3339623,7.05264444 25.2884052,7.0457047 25.242848,7.04801795 C25.0679085,7.05773358 25.0114176,7.10955029 25.0086842,7.28720759 C25.0032173,7.58746692 25.0036729,7.88865156 25.0086842,8.18891089 C25.0114176,8.41237046 25.0378408,8.44290531 25.261982,8.44521856 C25.8464804,8.45077035 26.4309788,8.46048598 27.0150217,8.44521856 C27.4651264,8.43504027 27.5730969,8.54191224 27.5617076,8.98883137 C27.5548741,9.2354234 27.5617076,9.48247808 27.5557852,9.72907011 C27.5503183,9.9358743 27.4865383,10.0020331 27.2824422,10.0173006 C27.1767496,10.0251656 27.0701458,10.0214644 26.9635421,10.0214644 C26.4168561,10.0214644 25.8701701,10.0214644 25.3234842,10.0256282 C25.0291849,10.0256282 25.007773,10.0487607 25.0073175,10.3379165 C25.0073175,11.0624251 25.0073175,11.7873964 25.0073175,12.5123677 C25.0100662,12.5896796 25.0061026,12.667087 24.9954726,12.7436923 C24.9676827,12.8968292 24.8670014,12.9925976 24.7143849,12.9958362 C24.365417,13.0027759 24.0164492,12.9958362 23.6665701,13 C23.5139536,13 23.4428845,12.9130219 23.4351397,12.7723766 C23.4278506,12.6502372 23.4410622,12.5267099 23.4410622,12.4022572 C23.4410622,11.7776808 23.4437956,11.1531044 23.4410622,10.5289906 C23.4399537,10.3943125 23.4276091,10.2599721 23.4041609,10.1274111 C23.3973273,10.0885485 23.3385586,10.0492234 23.2948237,10.0307174 C23.2501267,10.0194694 23.2036864,10.0172685 23.1581522,10.0242403 C22.5361451,10.0279415 21.9135305,10.0321053 21.2903085,10.0367318 C21.118558,10.0367318 21.0206101,9.97334889 21.0146876,9.80540722 C21.0019316,9.43528786 20.9991982,9.06516849 21.0146876,8.69504913 C21.0210656,8.50628825 21.105802,8.45215829 21.3313099,8.45077035 C21.8474726,8.44706915 22.3636353,8.45077035 22.8802535,8.4475318 C22.9941464,8.4475318 23.1080393,8.44429326 23.2219322,8.4475318 C23.3431143,8.4475318 23.4109945,8.39062595 23.414639,8.27033715 C23.4246616,7.93214058 23.4383287,7.59301872 23.4319507,7.25482214 C23.4287617,7.10631175 23.3144133,7.05727093 23.1736416,7.05773358 C22.71807,7.06050948 22.2624984,7.05773358 21.8069267,7.05773358 C21.6852129,7.05824005 21.5635576,7.05221722 21.4424694,7.03969026 C21.2534072,7.01702045 21.2146836,6.97908322 21.2087612,6.79587413 C21.2002572,6.41835238 21.19722,6.04067641 21.1996497,5.66284622 C21.1996497,5.49953105 21.2584185,5.45511673 21.45887,5.45372878 C21.9144416,5.45049024 22.3700133,5.45372878 22.8255849,5.45372878 C22.9622564,5.45372878 23.0989279,5.44956494 23.2355994,5.45095289 C23.3722709,5.45234083 23.4437956,5.38756994 23.4410622,5.2404475 C23.4365065,4.96285797 23.4442512,4.68526845 23.4360509,4.40767892 C23.4292173,4.18884585 23.3449366,4.10371839 23.1271733,4.10140515 C22.5659091,4.09585336 22.0041892,4.09631601 21.4415583,4.09446541 C21.0616115,4.09446541 20.9969203,4.03108247 21.0001093,3.65587396 C21.0001093,3.36301701 21.0001093,3.06969742 21.0219768,2.77684047 C21.0406552,2.49925094 21.093046,2.4687161 21.3595554,2.47287994 C21.7600028,2.48213292 22.1609059,2.47704378 22.6246778,2.47704378 Z" id="路径"></path>
                    <path d="M6.46506559,4.93405754 C6.20107338,4.93405754 5.96494194,4.91884495 5.7342913,4.94208641 C5.64888205,4.95096043 5.56758341,5.04434884 5.49587618,5.11111522 C5.45477013,5.14830156 5.44380852,5.21210994 5.40772654,5.25648 C5.21909542,5.4876269 5.14053718,5.51002322 4.86238622,5.37310988 C4.60798542,5.24633827 4.35997889,5.11111522 4.11745317,4.96913102 C3.96079343,4.87785547 3.9105527,4.71558781 3.97084158,4.55078472 C3.99371743,4.48370323 4.02434332,4.419099 4.06218836,4.35809187 C4.22067504,4.11215495 4.39058006,3.87213404 4.54358593,3.62281654 C4.62077397,3.49604494 4.66781756,3.35490588 4.73450072,3.22306341 C4.77415765,3.14755414 4.81996309,3.07494415 4.8715209,3.00586138 C4.92587223,2.93022099 4.99209865,2.86134175 5.04644999,2.78527879 C5.16702775,2.61624998 5.31500955,2.55328674 5.5095782,2.63653343 C5.74159904,2.73626043 5.95946113,2.86387718 6.18280402,2.97966192 C6.23193074,3.01224775 6.28422308,3.04054078 6.33900703,3.06417632 C6.48927249,3.1098141 6.59249436,3.19094793 6.60436944,3.35997674 C6.79528423,3.37434419 6.97569413,3.3984308 7.15610404,3.39927594 C7.97822512,3.40307909 8.8003462,3.4013888 9.62246728,3.39927594 C9.8124686,3.39927594 10.0024699,3.37899248 10.1920145,3.37856991 C10.4381941,3.37856991 10.4998532,3.44744915 10.4961993,3.66972204 C10.4911752,3.98665106 10.4961993,4.30358008 10.4961993,4.62008653 C10.4961993,4.83686598 10.4505259,4.88926491 10.2221589,4.8939132 C9.64576071,4.90616779 9.06844902,4.91757724 8.49159406,4.91081608 C8.13123099,4.90616779 8.12209631,4.89982921 8.11844244,5.2488737 C8.11844244,5.34057183 8.11433183,5.43226996 8.11844244,5.52354552 C8.12620691,5.70567407 8.18512559,5.76483415 8.38015098,5.76948244 C8.63866239,5.77497588 8.8971738,5.7715953 9.15659867,5.7715953 C9.50645686,5.7715953 9.85677179,5.76905987 10.2070867,5.7715953 C10.448699,5.77413073 10.4884348,5.80878164 10.4920887,6.02894167 C10.496656,6.35319527 10.496656,6.67716716 10.4920887,7.00085733 C10.4879781,7.2218625 10.4212949,7.29158688 10.1751153,7.29327717 C9.57451022,7.29792547 8.9739051,7.28905145 8.37329997,7.28651602 C8.30753029,7.28651602 8.24130387,7.29116431 8.18192845,7.29369974 C8.09469227,7.8050119 8.1138751,8.29688574 8.12712038,8.80481731 C8.28743399,8.8276362 8.41988683,8.85594853 8.55416661,8.8639774 C8.82820697,8.88045771 8.87753424,8.8352425 8.88438525,8.58507986 C8.88895258,8.40886732 8.88438525,8.23265479 8.88895258,8.05686483 C8.89945747,7.74669696 8.96705409,7.69683346 9.3077776,7.70739776 C9.58866897,7.71542663 9.86956034,7.70739776 10.149995,7.71627177 C10.4185545,7.7234555 10.4911752,7.79064445 10.4943724,8.03362336 C10.4989397,8.38520329 10.5062474,8.73762836 10.489805,9.09005343 C10.4762126,9.21375227 10.433831,9.33326126 10.3655734,9.44036564 C10.2835963,9.59643196 10.1801232,9.74202102 10.0577347,9.87350197 C9.70285246,10.2238142 9.24383485,10.389885 8.73320631,10.3936881 C7.24197002,10.404675 5.75073372,10.3983364 4.25721375,10.3966461 C4.02427945,10.3966461 3.9375,10.299032 3.9375,10.0801397 C3.93978367,9.41881447 3.94069714,8.75706668 3.9375,8.09405116 C3.9375,7.80120875 4.04072187,7.7023269 4.35130094,7.70655262 C4.5714467,7.70951062 4.79250593,7.67866286 5.01173821,7.68795945 C5.52693409,7.70951062 5.54474672,7.73021665 5.55707853,8.18194615 C5.56255934,8.39323216 5.55707853,8.60198274 5.55707853,8.84707452 C5.82107075,8.84707452 6.06725034,8.85848396 6.31342993,8.85045509 C6.4193922,8.84707452 6.46597906,8.76594069 6.46597906,8.67001684 C6.46597906,8.26913684 6.4647611,7.86783427 6.46232519,7.46610913 C6.46232519,7.31820892 6.34859844,7.30299633 6.22528028,7.3034189 C5.83751317,7.3034189 5.44883259,7.30679948 5.06106548,7.3034189 C4.78017411,7.3004609 4.49928274,7.28736116 4.21793464,7.27975487 C4.08730873,7.27637429 3.98956767,7.22820108 3.98956767,7.09720375 C3.98134646,6.7384401 3.96992811,6.37883131 3.98043299,6.02133537 C3.987284,5.79906248 4.03021699,5.77286302 4.27731005,5.7715953 C4.88613638,5.76821473 5.49496272,5.7715953 6.10424579,5.76905987 C6.50434471,5.76905987 6.52672468,5.74159269 6.50069084,5.36803902 C6.48059455,5.2323934 6.47465701,5.1009735 6.46506559,4.93405754 Z" id="路径"></path>
                    <path d="M41.8601088,2.7928095 C41.8601088,3.23764965 41.8709169,3.65597912 41.8556054,4.07385926 C41.8474993,4.298526 41.7966112,4.324138 41.5732441,4.324138 L38.1741001,4.321442 C38.1142053,4.321442 38.0538602,4.31829667 37.9939653,4.321442 C37.8052741,4.33582068 37.7602404,4.37985536 37.7390746,4.56498075 C37.7210611,4.72045013 37.6989946,4.87636885 37.6890872,5.03228757 C37.6836831,5.12215427 37.7206107,5.18955429 37.8039231,5.25695431 C37.9462296,5.36973701 38.0597145,5.5184664 38.1867096,5.65057044 C38.6298412,6.11158659 39.0734232,6.57245296 39.5174555,7.03316956 C39.7219085,7.24525496 39.9227588,7.46003636 40.1326159,7.6671791 C40.4122752,7.94351919 40.6995902,8.21132194 40.9787992,8.48766203 C41.0688666,8.57752873 41.1350661,8.68626743 41.2242329,8.77433679 C41.28974,8.8289783 41.3603108,8.87727475 41.4349906,8.91857284 C41.4652104,8.98573303 41.5023371,9.04958113 41.5457735,9.10909024 C41.649351,9.22681561 41.770942,9.32791564 41.8722679,9.44788768 C42.0582571,9.67255442 42.0393429,9.78309046 41.8272342,9.98214519 C41.6151254,10.1811999 41.4255335,10.3811533 41.2300873,10.5856001 C41.1102976,10.7109641 40.959885,10.7415188 40.8081215,10.6359254 C40.6936532,10.5517844 40.5861287,10.4586239 40.4865808,10.3573386 C40.188908,10.0639239 39.8678177,9.78848246 39.6079733,9.46451302 C39.3346187,9.12346891 39.0031706,8.84488215 38.7100012,8.52720338 C38.4848327,8.28096863 38.2560615,8.03293655 38.0236876,7.79299247 C37.8070755,7.56832573 37.5850593,7.34860166 37.3612418,7.13112426 C37.3112544,7.08214691 37.2441542,7.05069356 37.1509344,6.98823621 C37.0811322,7.15808427 37.0257407,7.30007365 36.9653955,7.44026569 C36.9264766,7.53653959 36.8813484,7.63019703 36.8302944,7.72064978 C36.575854,8.14661792 36.3394271,8.59100873 35.9832105,8.93969151 C35.6350999,9.27938763 35.3423809,9.68513576 34.8942955,9.9151945 C34.8875405,9.91878917 34.8789841,9.92148517 34.8753814,9.9273265 C34.7240681,10.1794026 34.4187396,10.1942306 34.2097832,10.3573386 C34.1449347,10.4081133 34.0773841,10.4557427 34.0138866,10.5083147 C33.8161887,10.6723214 33.6229941,10.6431147 33.4901447,10.435972 C33.3221689,10.1722133 33.1375308,9.91833983 32.9848665,9.64694241 C32.9285744,9.54629171 32.9317267,9.406549 32.929475,9.28433029 C32.929475,9.23939695 32.9844162,9.17738893 33.0294499,9.15671959 C33.5486885,8.92126884 33.9927208,8.57618073 34.4254947,8.21716328 C34.4430682,8.20388532 34.4592163,8.18882722 34.4736807,8.17222993 C34.6875908,7.91296451 34.9352762,7.6739191 35.1041526,7.38814301 C35.2487108,7.14280693 35.4905418,6.9504922 35.5351251,6.6418001 C35.5477346,6.55507873 35.6522128,6.48498271 35.6837363,6.39646402 C35.7604196,6.18822763 35.8240401,5.97543138 35.8742289,5.75930914 C35.9552896,5.39489969 36.0304959,5.0286929 36.0845363,4.65979011 C36.1246163,4.38345002 36.0597678,4.32458734 35.7855125,4.32548601 C34.9301724,4.32967978 34.074532,4.33537134 33.2185914,4.34256068 C32.9177663,4.34570601 32.8132881,4.24820065 32.8132881,3.94400188 C32.8132881,3.66721246 32.8101357,3.3899737 32.8164404,3.11318428 C32.8227452,2.83639485 32.9065079,2.7671975 33.1852665,2.75371749 C34.097199,2.71327748 35.0091315,2.74742682 35.9206136,2.73529482 C36.1408284,2.73259882 36.1719017,2.69036147 36.1818091,2.46569473 C36.2100302,1.82374696 36.2414037,1.18194898 36.2759295,0.540300767 C36.2849363,0.36640871 36.3322217,0.309792692 36.5101048,0.30574869 C36.8775798,0.297211354 37.2450548,0.299008688 37.6125299,0.30574869 C37.7881613,0.309343358 37.8660696,0.383483382 37.8629173,0.556027439 C37.8530098,1.16127964 37.8404004,1.76922784 37.8111285,2.37178403 C37.7985191,2.63509345 37.8561622,2.73125082 38.1335698,2.73125082 C39.0189324,2.73484548 39.904295,2.73125082 40.7905583,2.73125082 C41.0157268,2.73125082 41.2408953,2.71192948 41.4660639,2.71911881 C41.5962113,2.72451081 41.7191533,2.76495083 41.8601088,2.7928095 Z" id="路径"></path>
                    <path d="M5.8683802,1.07048327 C5.97248268,1.07763032 6.06204833,1.08879758 6.15208291,1.08879758 C7.80834405,1.09281779 9.46507411,1.10309167 11.122742,1.09415786 C11.7426676,1.09058434 12.2411403,1.32152332 12.6702114,1.71952455 C12.7724708,1.81140629 12.85345,1.92262594 12.9079589,2.0460553 C13.0228468,2.32925706 13.1236668,2.61692574 13.1231979,2.93005577 C13.1208532,5.23006509 13.1325765,7.5309678 13.115695,9.83008374 C13.1119435,10.3464579 13.042073,10.8677457 12.7518052,11.3331972 C12.4530967,11.8133895 12.0924895,12.235512 11.5677567,12.503973 C11.2596696,12.6607614 10.9436107,12.8028089 10.6298965,12.9506635 C10.5813133,12.973628 10.5283575,12.9869988 10.4742117,12.9899723 C10.2397466,12.9966726 10.0052816,13.0042663 9.77081654,12.9971193 C9.59074738,12.9913123 9.50305745,12.8890202 9.50680889,12.7224047 L9.52931753,11.7843546 C9.53494469,11.5422484 9.62310355,11.4859654 9.85756861,11.4421897 C10.1222285,11.3919501 10.3796256,11.3117199 10.6242693,11.2032103 C10.9907636,11.0416868 11.2662805,10.7373944 11.3801847,10.3683458 C11.4567158,10.1437017 11.4976503,9.90944186 11.5016376,9.67329538 C11.5124229,8.25907329 11.5063269,6.84485121 11.5063269,5.42973574 C11.5063269,4.70014128 11.5063269,3.97054681 11.5063269,3.24095235 C11.5063269,3.18868956 11.5063269,3.13642678 11.5063269,3.08461068 C11.49179,2.73485203 11.3656478,2.61960588 11.0045716,2.62005257 C9.8247435,2.62005257 8.64491535,2.62005257 7.46508721,2.62630624 C7.02007254,2.62630624 6.57412001,2.64908745 6.1300432,2.64998084 C5.80179212,2.64998084 5.47354105,2.63077314 5.14763463,2.62407279 C4.9867916,2.62094595 4.87096586,2.64774738 4.77858663,2.8206166 C4.57788455,3.19538992 4.32606908,3.54559526 4.09535547,3.9056278 C4.00156945,4.04856875 3.87448939,4.08430399 3.71505315,3.99853942 C3.41587575,3.8399643 3.11810513,3.67960241 2.82408595,3.51477362 C2.60134415,3.39104035 2.57695979,3.32537685 2.69419231,3.0975647 C2.81986558,2.85322501 2.87566826,2.57225669 3.09606541,2.37481949 C3.10587403,2.36314117 3.11291282,2.34957885 3.11669834,2.33506404 C3.29489178,1.91517498 3.61095067,1.57211669 3.82665852,1.17366877 C4.01141698,0.831206064 4.20055212,0.491125706 4.39406395,0.153427697 C4.42407547,0.100271529 4.48034709,0.0323745746 4.53474298,0.0243341458 C4.76451873,-0.0109544027 4.99054304,-0.0346289986 5.18608689,0.152087625 C5.28643794,0.24767939 5.43133734,0.311109439 5.56732707,0.362032155 C5.90917712,0.490232325 5.95231869,0.549195469 5.89557814,0.892700455 C5.88479275,0.942729789 5.87916559,0.992759124 5.8683802,1.07048327 Z" id="路径"></path>
                    <path d="M14.5207754,5.30577293 C14.4996092,5.27488573 14.4833967,5.24124319 14.4726584,5.20592549 C14.4197297,4.72385664 14.3874913,4.23952879 14.675231,3.80535056 C14.8229502,3.58261397 14.9947279,3.36936514 15.300752,3.31786013 C15.3487143,3.31135636 15.3948309,3.29600123 15.436442,3.27268029 C15.7944325,3.05400988 16.1947659,3.06394944 16.5979864,3.06982282 C17.0950351,3.0770516 17.5920837,3.06982282 18.0896136,3.06982282 C18.2820816,3.06982282 18.5101562,2.87329053 18.5183361,2.69437838 C18.5082386,2.63493845 18.4672863,2.58412022 18.4091105,2.55883887 C18.3287551,2.53398996 18.2349269,2.54573672 18.147354,2.54573672 C17.2172523,2.54799571 16.2871506,2.5520619 15.3565677,2.55296549 C14.9422803,2.55296549 14.6391432,2.28188647 14.6434737,1.9145744 C14.6425516,1.83271583 14.6656945,1.75220455 14.7103564,1.68189824 C14.9028244,1.4166926 15.1102087,1.16278192 15.3026767,0.898479878 C15.4335549,0.717760532 15.5519228,0.531167807 15.6674036,0.34231609 C15.8969217,-0.034031948 16.2048705,-0.103608896 16.5816267,0.151205382 C16.8183011,0.30398895 17.0450173,0.469945487 17.2605576,0.648183584 C17.3433188,0.720019524 17.3567916,0.859173421 17.4236742,1.00962228 C17.671958,1.00962228 17.9750951,1.01368846 18.277751,1.00962228 C18.6877079,1.0028453 19.0894849,1.02091724 19.4898184,1.13160783 C19.8747544,1.23823225 20.1114901,1.45464367 20.2784561,1.79258884 C20.4102966,2.06050527 20.3924934,2.34152386 20.3997109,2.60853669 C20.4054849,2.82359271 20.2486235,3.04316672 20.1812597,3.21575369 C20.2909665,3.34135364 20.3780583,3.45656222 20.4815098,3.55686146 C20.792091,3.84636808 20.9697861,4.23843707 20.9766338,4.64930991 C20.9939559,5.9513928 21.0218638,7.25483108 20.9708597,8.55555858 C20.9429519,9.27165899 20.5657146,9.85764147 19.8300056,10.1793219 C19.6179085,10.2673025 19.3907319,10.3188701 19.1592546,10.331578 C17.7638614,10.4458829 16.3612508,10.3794686 14.9624895,10.3921189 C14.9223192,10.3929462 14.8821346,10.391286 14.842197,10.3871491 C14.5121143,10.3473909 14.4476375,10.2800729 14.4447505,9.96562127 C14.4447505,9.7925825 14.4447505,9.61909193 14.4500434,9.44650495 C14.4553363,9.31954961 14.5024909,9.2395813 14.6704193,9.24681008 C14.8867047,9.25449056 15.1032981,9.24769639 15.3185553,9.22647915 C15.7394837,9.18121778 16.1498009,9.07212136 16.5335097,8.90344332 C16.7446895,8.81271489 16.9749608,8.7679275 17.2071477,8.77242179 C17.7518322,8.78145776 18.297479,8.77919877 18.8431258,8.77513258 C19.168878,8.77242179 19.251158,8.69109809 19.2516392,8.37890542 C19.2516392,7.22742198 19.2516392,6.07563735 19.2516392,4.92355152 C19.2516392,4.63078618 19.2295054,4.61181064 18.9273306,4.61090705 C18.1093415,4.61090705 17.2913525,4.60367827 16.4733634,4.61090705 C16.0403104,4.61542503 15.6462321,4.75909691 15.2704383,4.95156301 C15.0288909,5.07309678 14.780126,5.18333558 14.5207754,5.30577293 Z" id="路径"></path>
                    <path d="M31.2918021,11.3527207 C31.131245,11.5367488 30.9916105,11.7017066 30.846063,11.8614201 C30.6795931,12.0435412 30.5067556,12.2199411 30.339376,12.4015854 C30.2816945,12.4643356 30.2279134,12.5309004 30.1783641,12.6008697 C30.0769358,12.7438967 29.9614075,12.7915724 29.8090375,12.7438967 C29.6847806,12.6648853 29.564961,12.5784497 29.4501721,12.4850178 C29.3223633,12.35534 29.1945544,12.2251855 29.0631069,12.0988449 C28.8429664,11.8857347 28.8102182,11.7732201 28.9957912,11.5319812 C29.2987118,11.1381802 29.6239194,10.7629727 29.9509463,10.3877652 C30.2001963,10.1017112 30.3516566,9.79229606 30.3461985,9.38657611 C30.3320986,8.25809303 30.342105,7.12960994 30.3425598,6.00160361 C30.3425598,5.93009011 30.3425598,5.8585766 30.3398308,5.7870631 C30.3298244,5.58301124 30.2888892,5.53342854 30.0946744,5.52770746 C29.8295051,5.5196026 29.5643359,5.52484692 29.2987118,5.52055611 C29.015804,5.51578854 28.9721397,5.46954314 28.9694107,5.16823292 C28.9662269,4.8426081 28.9625882,4.51650652 28.9694107,4.1908817 C28.9739591,3.96251524 29.0280845,3.90482768 29.2423122,3.90101363 C29.7044253,3.89815309 30.1669933,3.90101363 30.6286515,3.91388606 C30.9641206,3.92149428 31.28759,4.04614589 31.5478746,4.26811628 C31.5669287,4.28050096 31.5834665,4.29670176 31.596542,4.31579195 C31.7757473,4.68909244 31.9745105,5.05667185 31.9663235,5.49433449 C31.9640493,5.6054188 31.9476752,5.71602635 31.9476752,5.82806418 C31.9476752,6.9484424 31.9517687,8.06882062 31.9431268,9.18872209 C31.939943,9.55391771 32.1250611,9.78943552 32.3756756,9.99253387 C32.4211592,10.0278139 32.4843814,10.0349652 32.5426003,10.0564193 C32.6362965,10.2847857 32.8155018,10.4378246 33.0056231,10.5775143 C33.1479867,10.6814473 33.29126,10.7853802 33.4422655,10.8745337 C33.5701803,10.9533469 33.7059183,11.017293 33.8470693,11.0652364 C34.0605932,11.1369625 34.2791195,11.1911586 34.5006682,11.2273337 C35.7669309,11.4151758 37.0409259,11.2845445 38.3112821,11.3093358 C39.4169878,11.3307899 40.5236032,11.3126731 41.631583,11.3212548 C41.7584822,11.3212548 41.8853814,11.3808494 42,11.4099315 C42,11.8690482 41.9963613,12.280966 42,12.6928838 C42,12.8649929 41.9240424,12.9717864 41.7530242,12.9822751 C41.5710899,12.9937172 41.3891556,13.0008686 41.2072213,13 C40.2597984,12.9937172 39.3128304,12.9817983 38.3654076,12.9775075 C37.3433916,12.9722632 36.3213757,12.9732167 35.2993598,12.9713097 C34.9891618,12.9713097 34.6789638,12.9679724 34.3687659,12.9670189 C33.9737542,12.9714489 33.5844771,12.8677549 33.2394087,12.6661854 C32.8200502,12.4185897 32.4008432,12.1706763 31.9817879,11.922445 C31.9503716,11.898012 31.916515,11.8772306 31.8808143,11.8604666 C31.6292902,11.7860925 31.4464462,11.6173207 31.2918021,11.3527207 Z" id="路径"></path>
                    <path d="M18.9260486,5.67113993 C18.8780765,6.08861732 18.74358,6.48960182 18.5322413,6.84522772 C18.4278131,7.02033834 18.325482,7.19767684 18.2130854,7.366995 C18.153532,7.45610983 18.0872684,7.55369056 18.0033904,7.61027847 C17.5001222,7.9471325 17.0232757,8.34235674 16.4130631,8.47023651 C15.7932045,8.59989858 15.1926379,8.55935133 14.6042336,8.32096918 C14.4318643,8.25101404 14.4163469,8.22026943 14.4549307,8.01530534 C14.530598,7.601815 14.67427,7.20573017 14.8793535,6.84522772 C15.1075017,6.44688446 15.3826216,6.09398976 15.7319736,5.82352627 C15.9660358,5.64917256 16.2233066,5.51295659 16.4952636,5.41939055 C16.8969522,5.27014925 17.3199418,5.19597816 17.7454655,5.20016809 C18.1099154,5.20551498 18.4475245,5.30042226 18.7872305,5.41137022 C18.9025627,5.44835287 18.9646325,5.52944736 18.9260486,5.67113993 Z" id="路径"></path>
                    <path d="M14.4389846,12.1209539 C14.4389846,11.9397953 14.4356442,11.7575986 14.4389846,11.576959 C14.4442339,11.3303965 14.5272678,11.2338478 14.750123,11.2073747 C15.1032554,11.1658484 15.4578195,11.1336655 15.8104748,11.084353 C16.4150948,11.0007812 17.0187604,10.9063088 17.6238576,10.8180654 C17.7259797,10.8030121 17.8290562,10.7993785 17.9311783,10.7848443 C18.3458703,10.7261884 18.7600852,10.6649371 19.1743,10.6042048 C19.2057956,10.5995331 19.236814,10.592266 19.2697412,10.5881134 L20.6097357,10.4038403 C20.8135027,10.37581 20.983388,10.5029844 20.9915005,10.7277456 C21.0058167,11.1071925 20.9986586,11.4876774 20.9943638,11.8697197 C20.9943638,12.0306342 20.886038,12.0898092 20.758624,12.1121296 C20.3768592,12.1785717 19.9912767,12.2470902 19.6066487,12.3073033 C19.20675,12.3701119 18.805897,12.4246152 18.4055211,12.4811948 C17.988443,12.5403699 17.5708878,12.5933159 17.1542869,12.6576817 C16.7562971,12.7189331 16.3606933,12.7993903 15.9612719,12.8570081 C15.5618504,12.9146259 15.1619518,12.9654956 14.7606215,12.9966404 C14.5034075,13.0163654 14.4618905,12.954595 14.451392,12.6675442 C14.451392,12.6415903 14.451392,12.6156363 14.451392,12.5896824 L14.451392,12.1225112 L14.4389846,12.1209539 Z" id="路径"></path>
                    <path d="M1.63359203,11.8173025 C1.59946294,11.8708801 1.55244064,11.918795 1.53348003,11.9784709 C1.45763761,12.2232724 1.39203392,12.4741723 1.3131578,12.7189739 C1.22404296,12.9947024 1.10572879,13.0561205 0.873271769,12.9528857 C0.632851298,12.8461662 0.394326887,12.7350907 0.156560901,12.6187882 C0.0162524241,12.5512717 -0.0216687859,12.4828841 0.0109434547,12.3138752 C0.0457135196,12.1459226 0.0892756876,11.9805334 0.141392417,11.8186093 C0.276012712,11.3795346 0.415941977,10.9422022 0.552458333,10.5039987 C0.628300753,10.2661665 0.695800507,10.0248496 0.77050529,9.78919545 C0.903735141,9.3687059 1.03822903,8.94908752 1.17398696,8.53034032 C1.23390248,8.34739251 1.29609326,8.16531589 1.36359301,7.98672398 C1.43753937,7.79549997 1.52324131,7.76892898 1.69881651,7.82773363 C1.89676523,7.89612126 2.10571109,7.92704815 2.29683399,8.01285938 C2.42040626,8.06933501 2.52700069,8.16589616 2.60361658,8.29076581 C2.64608834,8.36481611 2.61802664,8.52032175 2.5823807,8.62094304 C2.42912897,9.0612014 2.30044203,9.51222387 2.19710121,9.97127208 C2.15918,10.1411522 2.06627303,10.2944799 2.00332383,10.4582617 C1.98095031,10.5166308 1.94985492,10.5889387 1.96047286,10.6429519 C1.99118904,10.8023778 1.9085208,10.9199871 1.85088056,11.0323693 C1.71853554,11.2945945 1.66620427,11.5315555 1.63359203,11.8173025 Z" id="路径"></path>
                    <path d="M32.1379742,2.85338532 C31.9521176,2.94636866 31.7907158,2.89683548 31.634205,2.73520089 C31.3798749,2.47449994 31.115763,2.22770304 30.8475752,1.98525115 C30.6780218,1.83230659 30.4880894,1.70456312 30.3177208,1.55379107 C30.1575418,1.41214355 30.1465371,1.30699417 30.2769628,1.12754501 C30.4073885,0.948095856 30.5528946,0.792978789 30.6922871,0.62656468 C30.7599454,0.546181886 30.8324947,0.470144108 30.8960772,0.385416299 C30.9694416,0.284177428 31.0440288,0.27374939 31.1406253,0.349787168 C31.2615266,0.454440733 31.3885396,0.550804312 31.5208977,0.638296223 C31.8958715,0.865540554 32.1730261,1.21965935 32.5076495,1.49556786 C32.5398483,1.52207246 32.5691941,1.55248757 32.6026157,1.57725416 C32.8520548,1.76061383 32.8773248,1.8900953 32.6882075,2.14210622 C32.5545212,2.32025187 32.4029014,2.48058296 32.2602483,2.65264559 C32.2151028,2.71640279 32.1742429,2.78348332 32.1379742,2.85338532 Z" id="路径"></path>
                    <path d="M0.261311251,0.465179316 C0.317668481,0.412091532 0.381229267,0.377177945 0.411314706,0.321698819 C0.598607154,-0.0355676169 0.773187446,-0.0934380838 1.09692371,0.13900032 C1.54947651,0.464701047 2.00033435,0.792793116 2.47704024,1.07401489 C2.61729771,1.15675531 2.65331549,1.30454022 2.60416181,1.47910816 C2.50373577,1.83828767 2.31474837,2.14533593 2.14567668,2.46338436 C2.06770878,2.61069101 1.89990831,2.62982174 1.75456598,2.56382071 C1.20921444,2.31559945 0.746068177,1.90524523 0.234615721,1.59054468 C-0.0501365987,1.41549847 -0.0620012787,1.26197434 0.12529117,0.935317076 C0.182105632,0.844702261 0.230256692,0.747550115 0.268938546,0.645486473 C0.290125474,0.589050811 0.265124899,0.516832294 0.261311251,0.465179316 Z" id="路径"></path>
                    <path d="M0,5.11670318 C0.0262305262,5.02999125 0.0568080267,4.9449997 0.0915872644,4.86213221 C0.197167027,4.63979741 0.314195199,4.42409947 0.416382841,4.19844624 C0.566060176,3.87134388 0.670791908,3.82488586 0.967602487,4.00171076 C1.35176018,4.23068242 1.73082969,4.46818718 2.10947519,4.70806225 C2.23639158,4.78506733 2.35674715,4.8748805 2.46904,4.97638101 C2.63525393,5.13187315 2.66790309,5.33714174 2.57037961,5.54525469 C2.49914507,5.69648028 2.42070228,5.84438744 2.33801933,5.98802804 C2.26296866,6.11886899 2.18155776,6.24544339 2.09633072,6.36727717 C1.98905489,6.52134712 1.80927249,6.53651709 1.66553136,6.43743825 C1.38016919,6.23928059 1.08717475,6.05439664 0.797148412,5.86429802 C0.664431682,5.77707072 0.530866921,5.69221373 0.398574206,5.60403831 C0.33836406,5.56374309 0.285362171,5.49547824 0.220911874,5.47983422 C0.037737345,5.43716869 0.0127204534,5.29637246 0,5.11670318 Z" id="路径"></path>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const radioSelected = (width = 14, height = 14, color = '#59B18A') => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg">
   
    <g id="Radio-Button-&amp;-Check-Box" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Radio-Button" transform="translate(-140.000000, -307.000000)" fill="${color}">
            <g id="checked" transform="translate(140.000000, 307.000000)">
                <path d="M7,0 C10.8659932,0 14,3.13400675 14,7 C14,10.8659932 10.8659932,14 7,14 C3.13400675,14 0,10.8659932 0,7 C0,3.13400675 3.13400675,0 7,0 Z M7,5 C5.8954305,5 5,5.8954305 5,7 C5,8.1045695 5.8954305,9 7,9 C8.1045695,9 9,8.1045695 9,7 C9,5.8954305 8.1045695,5 7,5 Z" id="radio_checked"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const radioUnSelected = (width = 14, height = 14, color = '#D5D8DE') => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <title>radio_unchecked</title>
    <g id="Radio-Button-&amp;-Check-Box" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Radio-Button" transform="translate(-238.000000, -307.000000)" stroke="${color}">
            <g id="basic" transform="translate(140.000000, 307.000000)">
                <g id="unchecked" transform="translate(98.000000, 0.000000)">
                    <circle id="radio_unchecked" cx="7" cy="7" r="6.5"/>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const notActivateMemberIcon = (width = 32, height = 29) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 32 29"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <linearGradient x1="78.9883282%" y1="61.264924%" x2="15.6883778%" y2="20.963772%" id="linearGradient-1">
            <stop stop-color="#FFDFB8" offset="0%"></stop>
            <stop stop-color="#F4D334" offset="100%"></stop>
        </linearGradient>
        <path d="M20.6194044,11.736014 L11.8391914,21 L0,8.26048951 L0,5.42744755 L5.79804238,0 L18.0083956,0 L23.8,5.54982517 L23.8,8.38286713 L20.618,11.736 L18.918,11.736 L18.8684868,11.7893797 L20.5108494,11.8504818 L20.618,11.736 L20.6194044,11.736014 Z M17.0164633,1.60314073 L16.9524677,1.60314073 C18.5758363,3.13286101 20.1970589,4.66258129 21.8161355,6.19230157 L21.8161355,6.19230157 L21.8161355,8.57866521 C20.826339,9.63111684 19.8386774,10.6835664 18.8531507,11.736014 L18.8531507,11.736014 L17.4708387,13.2045455 L11.8264114,19.2255184 C8.45812096,15.6378144 5.0876845,12.0480708 1.71510205,8.45628759 L1.71510205,8.45628759 L1.71510205,6.25349038 L6.51477422,1.66432955 L6.48277641,1.63373514 L1.66388635,6.24125262 L1.66388635,8.45628759 L11.8264114,19.2867072 L18.9171463,11.736014 L18.918,11.736 L21.8801311,8.57866521 L21.8801311,6.19230157 L17.0164633,1.60314073 Z M8.87450844,6.29411765 L4.62310924,6.29411765 L11.710839,16.2941176 L18.9088235,6.29411765 L14.5348748,6.29411765 L14.8901673,7.29282945 L11.7047069,11.9166804 L8.51921592,7.41603954 L8.87450844,6.29411765 Z" id="path-2"></path>
        <filter x="-29.4%" y="-23.8%" width="158.8%" height="166.7%" filterUnits="objectBoundingBox" id="filter-3">
            <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.206718818 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
    </defs>
    <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g  transform="translate(-35.000000, -262.000000)" fill-rule="nonzero">
            <g  transform="translate(10.000000, 244.000000)">
                <g  transform="translate(29.000000, 20.000000)">
                    <use fill="black" fill-opacity="1" filter="url(#filter-3)" xlink:href="#path-2"></use>
                    <use fill="url(#linearGradient-1)" xlink:href="#path-2"></use>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const activateMemberIcon = (width = 16, height = 16) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 16 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g  transform="translate(-23.000000, -260.000000)" fill-rule="nonzero">
            <g id="编组-4备份-4" transform="translate(10.000000, 244.000000)">
                <g id="编组-20备份" transform="translate(13.000000, 16.000000)">
                    <path d="M11.9551534,0 L3.84912057,0 L0,3.60309543 L0,5.48385438 L7.85963123,13.9411765 L13.6885122,7.79113534 L12.5584417,7.79113534 L7.85114708,12.8037804 L1.10459682,5.61383798 L1.10459682,4.14335258 L4.3036919,1.08458047 L4.32493415,1.10489104 L1.13859716,4.15147681 L1.13859716,5.61383798 C3.37753845,7.99829911 5.61505509,10.3814062 7.85114708,12.7631592 L11.5982879,8.76604278 L12.5159572,7.79113534 C13.1702144,7.09245167 13.8258889,6.39376664 14.4829807,5.69508027 L14.4829807,4.11085567 C13.4081315,3.09532708 12.3318577,2.07979849 11.2541592,1.0642699 L11.2966437,1.0642699 L14.5254652,4.11085567 L14.5254652,5.69508027 L12.5261383,7.82656297 L13.6164462,7.86712658 L15.8,5.56509667 L15.8,3.68433772 L11.9551534,0 Z" id="路径" fill="#C48530"></path>
                    <polygon id="路径" fill="#FFFFFF" points="12.5529165 4.17844957 7.77442254 10.8171033 3.06912294 4.17844957 5.89148039 4.17844957 5.65561393 4.92325314 7.77035167 7.91107354 9.88506907 4.84145821 9.64920261 4.17844785"></polygon>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const badReminderMember = (width = 48, height = 48) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <radialGradient cx="66.5401459%" cy="59.2171351%" fx="66.5401459%" fy="59.2171351%" r="51.5662518%" id="radialGradient-1">
            <stop stop-color="#FBE2B6" offset="0%"></stop>
            <stop stop-color="#F4D59B" offset="100%"></stop>
        </radialGradient>
    </defs>
    <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g  transform="translate(-27.000000, -481.000000)">
            <g id="差评提醒" transform="translate(27.000000, 481.000000)">
                <circle id="椭圆形" fill="url(#radialGradient-1)" cx="24" cy="24" r="24"></circle>
                <g id="提醒_remind备份" transform="translate(14.000000, 14.000000)">
                    <path d="M10,0 C6.134,0 3,3.134 3,7 L3,17 L17,17 L17,7 C17,3.134 13.866,0 10,0 Z" id="路径"></path>
                    <path d="M3,17 L3,7 C3,3.134 6.134,0 10,0 C13.866,0 17,3.134 17,7 L17,17 M0,17 L20,17" id="形状" stroke="#5C3813" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M10,20 C11.3807,20 12.5,18.8807 12.5,17.5 L12.5,17 L7.5,17 L7.5,17.5 C7.5,18.8807 8.6193,20 10,20 Z" id="路径" stroke="#5C3813" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                </g>
            </g>
        </g>
    </g>
</svg>
  `
  )
}

export const autoPackMember = (width = 48, height = 48) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <radialGradient cx="66.5401459%" cy="59.2171351%" fx="66.5401459%" fy="59.2171351%" r="51.5662518%" id="radialGradient-1">
            <stop stop-color="#FBE2B6" offset="0%"></stop>
            <stop stop-color="#F4D59B" offset="100%"></stop>
        </radialGradient>
    </defs>
    <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g  transform="translate(-210.000000, -481.000000)">
            <g id="自动打包" transform="translate(210.000000, 481.000000)">
                <circle id="椭圆形备份-2" fill="url(#radialGradient-1)" cx="24" cy="24" r="24"></circle>
                <g id="托运_consignment备份" transform="translate(14.000000, 16.000000)" stroke="#5C3813" stroke-width="2">
                    <path d="M2,4 C2,3.4477 2.447715,3 3,3 L17,3 C17.5523,3 18,3.4477 18,4 L18,12 C18,12.5523 17.5523,13 17,13 L3,13 C2.447715,13 2,12.5523 2,12 L2,4 Z" id="路径" stroke-linejoin="round"></path>
                    <line x1="6" y1="3" x2="6" y2="13" id="路径" stroke-linecap="round" stroke-linejoin="round"></line>
                    <line x1="14" y1="3" x2="14" y2="13" id="路径" stroke-linecap="round" stroke-linejoin="round"></line>
                    <line x1="12" y1="3" x2="16" y2="3" id="路径" stroke-linecap="round" stroke-linejoin="round"></line>
                    <line x1="4" y1="3" x2="8" y2="3" id="路径" stroke-linecap="round" stroke-linejoin="round"></line>
                    <line x1="4" y1="13" x2="8" y2="13" id="路径" stroke-linecap="round" stroke-linejoin="round"></line>
                    <line x1="12" y1="13" x2="16" y2="13" id="路径" stroke-linecap="round" stroke-linejoin="round"></line>
                    <line x1="0" y1="16" x2="20" y2="16" id="路径" stroke-linecap="round" stroke-linejoin="round"></line>
                    <line x1="7" y1="16" x2="7" y2="17" id="路径" stroke-linecap="round"></line>
                    <line x1="4" y1="16" x2="4" y2="17" id="路径" stroke-linecap="round"></line>
                    <line x1="1" y1="16" x2="1" y2="17" id="路径" stroke-linecap="round"></line>
                    <line x1="10" y1="16" x2="10" y2="17" id="路径" stroke-linecap="round"></line>
                    <line x1="13" y1="16" x2="13" y2="17" id="路径" stroke-linecap="round"></line>
                    <line x1="16" y1="16" x2="16" y2="17" id="路径" stroke-linecap="round"></line>
                    <line x1="19" y1="16" x2="19" y2="17" id="路径" stroke-linecap="round"></line>
                    <polyline id="路径" stroke-linecap="round" stroke-linejoin="round" points="13 3 13 0 7 0 7 3"></polyline>
                </g>
            </g>
        </g>
    </g>
</svg>
  `
  )
}

export const autoReplyMember = (width = 48, height = 48) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <radialGradient cx="66.5401459%" cy="59.2171351%" fx="66.5401459%" fy="59.2171351%" r="51.5662518%" id="radialGradient-1">
            <stop stop-color="#FBE2B6" offset="0%"></stop>
            <stop stop-color="#F4D59B" offset="100%"></stop>
        </radialGradient>
    </defs>
    <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g  transform="translate(-118.000000, -481.000000)">
            <g id="自动回评" transform="translate(118.000000, 481.000000)">
                <circle id="椭圆形备份" fill="url(#radialGradient-1)" cx="24" cy="24" r="24"></circle>
                <g id="沟通_communication备份" transform="translate(14.000000, 15.000000)" stroke="#5C3813" stroke-linecap="round" stroke-width="2">
                    <polygon id="路径" stroke-linejoin="round" points="14.5 16 9 16 9 12 16 12 16 8 20 8 20 16 17.5 16 16 17.5"></polygon>
                    <polygon id="路径" stroke-linejoin="round" points="0 0 16 0 16 12 6.5 12 4.5 14 2.5 12 0 12"></polygon>
                    <line x1="7.5" y1="6" x2="8" y2="6" id="路径"></line>
                    <line x1="11" y1="6" x2="11.5" y2="6" id="路径"></line>
                    <line x1="4" y1="6" x2="4.5" y2="6" id="路径"></line>
                </g>
            </g>
        </g>
    </g>
</svg>
  `
  )
}

export const memberBackground = (width = 355, height = 58) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 355 58" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <linearGradient x1="86.571718%" y1="50.9232924%" x2="2.34882363%" y2="49.1505434%" id="linearGradient-1">
            <stop stop-color="#35A54B" offset="0%"/>
            <stop stop-color="#064C50" offset="100%"/>
        </linearGradient>
        <path d="M8,0 L347,0 C351.418278,-1.69980292e-15 355,3.581722 355,8 L355,50 C355,54.418278 351.418278,58 347,58 L8,58 C3.581722,58 -3.47095419e-16,54.418278 0,50 L0,8 C-1.42926142e-15,3.581722 3.581722,-7.65539184e-17 8,0 Z" id="path-2"></path>
        <filter x="-10.3%" y="-10.3%" width="120.6%" height="120.6%" filterUnits="objectBoundingBox" id="filter-4">
            <feGaussianBlur stdDeviation="6" in="SourceGraphic"></feGaussianBlur>
        </filter>
    </defs>
    <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g  transform="translate(-10.000000, -244.000000)">
            <g  transform="translate(10.000000, 244.000000)">
                <mask id="mask-3" fill="white">
                    <use xlink:href="#path-2"></use>
                </mask>
                <use  fill="url(#linearGradient-1)" xlink:href="#path-2"></use>
                <path d="M277.5,11 C325.824916,11 365,50.1750844 365,98.5 C365,146.824916 325.824916,186 277.5,186 C229.175084,186 190,146.824916 190,98.5 C190,50.1750844 229.175084,11 277.5,11 Z M279.5,22 C236.145647,22 201,57.1456471 201,100.5 C201,143.854353 236.145647,179 279.5,179 C322.854353,179 358,143.854353 358,100.5 C358,57.1456471 322.854353,22 279.5,22 Z" fill="#2F7D49" filter="url(#filter-4)" mask="url(#mask-3)"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const activateNowIcon = (width = 16, height = 16) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">

    <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="我的页面-配送商户" transform="translate(-330.000000, -266.000000)">
            <g id="编组-4" transform="translate(10.000000, 244.000000)">
                <g id="编组-9" transform="translate(240.000000, 15.000000)">
                    <g id="右-圆_right-c备份" transform="translate(80.000000, 7.000000)">
                        <path d="M8,16 C12.41828,16 16,12.41828 16,8 C16,3.58172 12.41828,0 8,0 C3.58172,0 0,3.58172 0,8 C0,12.41828 3.58172,16 8,16 Z" id="路径" fill="#5C3813" fill-rule="nonzero"></path>
                        <polyline id="路径" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" points="6.8 11.6 10.4 8 6.8 4.4"></polyline>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const activateIcon = (width = 20, height = 20) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g  transform="translate(-334.000000, -257.000000)">
            <g  transform="translate(10.000000, 244.000000)">
                <g  transform="translate(324.000000, 13.000000)">
                    <path d="M10,20 C15.52285,20 20,15.52285 20,10 C20,4.47715 15.52285,0 10,0 C4.47715,0 0,4.47715 0,10 C0,15.52285 4.47715,20 10,20 Z" id="路径" fill="#FFFFFF" fill-rule="nonzero"></path>
                    <polyline id="路径" stroke="#35A54B" stroke-linecap="round" stroke-linejoin="round" points="8.5 14.5 13 10 8.5 5.5"></polyline>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const noImage = (width = 80, height = 80) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 80 80" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <path d="M7.81622064,0 C3.51735346,0 0,3.34296379 0,7.42852239 L0,7.42852239 L0,44.5714776 C0,48.6572078 3.51735346,52 7.81622064,52 L7.81622064,52 L26.1839599,52 L34,33.057225 L33.2184863,31.5715205 L29.3105565,34.9141411 L23.4483008,27.8570019 L5.86207519,37.5143384 L5.86207519,9.28578171 C5.86207519,7.05713918 7.42528321,5.5714347 9.77018551,5.5714347 L9.77018551,5.5714347 L28.5288622,5.5714347 C28.9194385,3.71434701 29.7011328,1.48570448 30.0920703,0 L30.0920703,0 L7.81622064,0 Z" id="path-1"></path>
        <linearGradient x1="49.9998897%" y1="-1.96220489%" x2="49.9998897%" y2="98.173605%" id="linearGradient-3">
            <stop stop-color="#E3E7EE" offset="0%"></stop>
            <stop stop-color="#EEF0F4" offset="100%"></stop>
        </linearGradient>
        <path d="M4.83344786,0 L2.97452195,5.5714347 L19.7051987,5.5714347 C21.9358754,5.5714347 23.4232223,7.05713918 23.4232223,9.28578171 L23.4232223,9.28578171 L23.4232223,30.4571992 L15.9871751,18.5713918 L5.20519868,28.2287283 L7.80762624,32.6856702 L0,52 L21.5641246,52 C25.653899,52 29,48.6572078 29,44.5714776 L29,44.5714776 L29,7.42852239 C29,3.34296379 25.653899,0 21.5641246,0 L21.5641246,0 L4.83344786,0 Z" id="path-4"></path>
        <linearGradient x1="49.9998897%" y1="-1.96220489%" x2="49.9998897%" y2="98.173605%" id="linearGradient-6">
            <stop stop-color="#E3E7EE" offset="0%"></stop>
            <stop stop-color="#EEF0F4" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g id="商品主页" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="商品-缺失图片" transform="translate(-92.000000, -315.000000)">
            <g id="编组-11备份" transform="translate(82.000000, 305.000000)">
                <g id="暂无图片" transform="translate(10.000000, 10.000000)">
                    <rect id="矩形" stroke-opacity="0.00608473558" stroke="#000000" x="0.5" y="0.5" width="79" height="79"></rect>
                    <g id="编组" transform="translate(9.000000, 15.000000)">
                        <mask id="mask-2" fill="white">
                            <use xlink:href="#path-1"></use>
                        </mask>
                        <g id="Clip-4"></g>
                        <path d="M7.81622064,0 C3.51735346,0 0,3.34296379 0,7.42852239 L0,7.42852239 L0,44.5714776 C0,48.6572078 3.51735346,52 7.81622064,52 L7.81622064,52 L26.1839599,52 L34,33.057225 L33.2184863,31.5715205 L29.3105565,34.9141411 L23.4483008,27.8570019 L5.86207519,37.5143384 L5.86207519,9.28578171 C5.86207519,7.05713918 7.42528321,5.5714347 9.77018551,5.5714347 L9.77018551,5.5714347 L28.5288622,5.5714347 C28.9194385,3.71434701 29.7011328,1.48570448 30.0920703,0 L30.0920703,0 L7.81622064,0 Z" id="Fill-3" fill="url(#linearGradient-3)" mask="url(#mask-2)"></path>
                    </g>
                    <g id="编组" transform="translate(41.000000, 15.000000)">
                        <mask id="mask-5" fill="white">
                            <use xlink:href="#path-4"></use>
                        </mask>
                        <g id="Clip-6"></g>
                        <path d="M4.83344786,0 L2.97452195,5.5714347 L19.7051987,5.5714347 C21.9358754,5.5714347 23.4232223,7.05713918 23.4232223,9.28578171 L23.4232223,9.28578171 L23.4232223,30.4571992 L15.9871751,18.5713918 L5.20519868,28.2287283 L7.80762624,32.6856702 L0,52 L21.5641246,52 C25.653899,52 29,48.6572078 29,44.5714776 L29,44.5714776 L29,7.42852239 C29,3.34296379 25.653899,0 21.5641246,0 L21.5641246,0 L4.83344786,0 Z" id="Fill-5" fill="url(#linearGradient-6)" mask="url(#mask-5)"></path>
                    </g>
                    <text id="暂无" font-family="PingFangSC-Regular, PingFang SC" font-size="12" font-weight="normal" letter-spacing="-1.32" fill="#979A9F">
                        <tspan x="17" y="37">暂无</tspan>
                    </text>
                    <text id="图片" font-family="PingFangSC-Regular, PingFang SC" font-size="12" font-weight="normal" letter-spacing="-1.32" fill="#979A9F">
                        <tspan x="39" y="37">图片</tspan>
                    </text>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const close = (width = 14, height = 14) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g  transform="translate(-344.000000, -499.000000)">
            <g  transform="translate(0.000000, 482.000000)">
                <g  transform="translate(342.000000, 15.000000)">
                    <rect id="bg" fill-opacity="0" fill="#00AAEE" x="0" y="0" width="18" height="18"></rect>
                    <g  transform="translate(2.454545, 2.863636)" fill="#CCCCCC" fill-rule="nonzero">
                        <g id="delete">
                            <path d="M12.527554,1.07147759 L12.3836417,1.16836833 L1.50247087,12.0495568 C1.25207019,12.2999399 0.793526684,12.2473812 0.543143581,11.9969805 C0.307455806,11.7613103 0.267307322,11.3615306 0.475256783,11.1096709 L0.516829097,11.0639502 L5.61735652,6.01448725 L0.748280538,1.145464 C0.512592764,0.909793809 0.462161064,0.521756248 0.670110525,0.269861423 L0.711682839,0.224158245 C0.947370613,-0.0115471073 1.33398434,-0.0385295606 1.58584401,0.169402322 L1.63158235,0.211009792 L6.50069348,5.07999788 L11.3980175,0.182744134 C11.6484182,-0.0676565476 12.1069441,-0.0150803146 12.3573624,0.235302789 C12.5930502,0.470990564 12.7355035,0.819600344 12.527554,1.07147759 Z M12.4996223,11.1053115 C12.7500406,11.3557298 12.8376149,11.7764275 12.5690384,12.045004 C12.3162647,12.2977778 11.9287193,12.3256919 11.6752425,12.1193596 L11.6293635,12.0779103 L10.0405277,10.4890745 L8.09297463,8.54152144 C7.84259153,8.29113834 7.75499963,7.870423 8.02355854,7.6018641 C8.27633227,7.34907279 8.66389522,7.32114111 8.9173545,7.52750854 L8.96325103,7.56895781 L12.4996223,11.1053291 L12.4996223,11.1053115 Z" id="形状"></path>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const menu_left = (width = 24, height = 24) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="#333333" fill-rule="evenodd">
        <g id="工作台-导航" transform="translate(-12.000000, -51.000000)">
            <rect fill="#F5F5F5" x="0" y="0" width="375" height="918"></rect>
            <g id="编组-10" transform="translate(0.000000, 44.000000)">
                <g id="导航" fill="#FFFFFF">
                    <rect id="矩形" x="0" y="0" width="375" height="44"></rect>
                </g>
                <g id="更多我的" transform="translate(12.000000, 7.000000)">
                    <rect id="矩形" fill="#333333" opacity="0" x="0" y="0" width="24" height="24"></rect>
                    <g id="更多" transform="translate(3.000000, 5.000000)" fill="#333333">
                        <rect id="矩形" x="0" y="0" width="18" height="2" rx="1"></rect>
                        <rect id="矩形备份-2" x="0" y="6" width="14" height="2" rx="1"></rect>
                        <rect id="矩形备份-3" x="0" y="13" width="15" height="2" rx="1"></rect>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const this_down = (width = 16, height = 16) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="工作台-导航" transform="translate(-180.000000, -56.000000)" fill="#333333" fill-rule="nonzero" stroke="#999999" stroke-width="0.5">
            <g id="编组-10" transform="translate(0.000000, 44.000000)">
                <g id="编组-4" transform="translate(52.000000, 10.000000)">
                    <g id="副导航图标/箭头-未选中" transform="translate(128.000000, 2.000000)">
                        <path d="M9.94511909,3.74332344 L10.0282056,3.79880389 C10.1579141,3.90169169 10.1950804,4.07800987 10.1274611,4.22158281 L10.0723657,4.30503458 L6.77687317,8.01532897 L10.0490584,11.6993711 C10.1589677,11.8231354 10.1650398,12.0032203 10.0735827,12.1329148 L10.0124,12.1994206 L10.0048704,12.2055656 C9.81789682,12.3538774 9.54763165,12.3303012 9.3891622,12.1518554 L5.91986308,8.24522129 C5.79815735,8.10817351 5.80321326,7.90038807 5.92976358,7.77001717 L9.42262293,3.84110722 C9.55636848,3.69050198 9.7724803,3.65428257 9.94511909,3.74332344 Z" id="icon" transform="translate(7.996122, 7.999154) rotate(-90.000000) translate(-7.996122, -7.999154) "></path>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const search_icon = (width = 24, height = 24) => {
  return (
    `
<svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g id="手动发单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="图标/搜索栏/搜索备份">
            <rect id="Rectangle-3" x="0" y="0" width="20" height="20"></rect>
            <g id="icon" transform="translate(3.000000, 3.000000)" stroke="#333333" stroke-width="1.5">
                <line x1="11.5" y1="11.5" x2="13.894359" y2="13.8963032" id="路径-2" stroke-linecap="round" stroke-linejoin="round"></line>
                <circle id="Oval-2" cx="7" cy="7" r="6.25"></circle>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const menu = (width = 24, height = 24) => {
  return (
    `
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>更多我的备份</title>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="更多我的备份">
            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="24" height="24"></rect>
            <g id="更多" transform="translate(3.000000, 5.000000)" fill="#333333">
                <rect id="矩形" x="0" y="0" width="18" height="2" rx="1"></rect>
                <rect id="矩形备份-2" x="0" y="6" width="14" height="2" rx="1"></rect>
                <rect id="矩形备份-3" x="0" y="13" width="15" height="2" rx="1"></rect>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const empty_data = () => {
  return (
    `
<svg width="122px" height="94px" viewBox="0 0 122 94" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient x1="0.318170704%" y1="100%" x2="99.6818293%" y2="0%" id="linearGradient-1">
            <stop stop-color="#F8F8F8" offset="0%"></stop>
            <stop stop-color="#CECECE" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-2">
            <stop stop-color="#CCCCCC" offset="0%"></stop>
            <stop stop-color="#E1E1E1" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-3">
            <stop stop-color="#EEEEEE" offset="0%"></stop>
            <stop stop-color="#D8D8D8" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="100%" x2="50%" y2="3.061617e-15%" id="linearGradient-4">
            <stop stop-color="#F1F1F1" offset="0%"></stop>
            <stop stop-color="#EEEEEE" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-5">
            <stop stop-color="#C5C5C5" offset="0%"></stop>
            <stop stop-color="#B1B1B1" offset="6.55030708%"></stop>
            <stop stop-color="#D8D8D8" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="99.0245665%" id="linearGradient-6">
            <stop stop-color="#CFCFCF" offset="0%"></stop>
            <stop stop-color="#EBEBEB" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id="linearGradient-7">
            <stop stop-color="#E2E2E2" offset="0%"></stop>
            <stop stop-color="#C8C8C8" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id="linearGradient-8">
            <stop stop-color="#EFEEEE" offset="0%"></stop>
            <stop stop-color="#E2E2E2" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="手动发单-暂无绑定店铺" transform="translate(-127.000000, -226.000000)">
            <rect fill="#F5F5F5" x="0" y="0" width="375" height="812"></rect>
            <g id="编组" transform="translate(128.000000, 226.000000)">
                <ellipse id="椭圆形" fill="#E7E7E7" cx="61.7142857" cy="84.7777778" rx="54" ry="9"></ellipse>
                <g id="分组-11" transform="translate(0.000000, -0.000000)">
                    <g id="分组">
                        <ellipse id="椭圆形" fill="url(#linearGradient-1)" transform="translate(110.059202, 48.114639) rotate(24.000000) translate(-110.059202, -48.114639) " cx="110.059202" cy="48.1146393" rx="7.53484289" ry="7.55893157"></ellipse>
                        <g id="Group-3">
                            <rect id="Rectangle-15" fill="url(#linearGradient-2)" x="34.0607028" y="21.9083909" width="54.0646343" height="63.1639957" rx="5.14285714"></rect>
                            <path d="M3.69511654,3.9385425 L19.1843945,3.92795688 C20.195202,6.15910133 20.6991842,9.30361568 20.6963412,13.3614999 C20.6934981,17.4193841 21.9058558,20.9692026 24.3334142,24.0109553 L8.84413619,24.0215409 C6.41700053,20.3764282 5.204785,16.6237155 5.20748961,12.7634029 C5.21019422,8.90309028 4.70606986,5.96147015 3.69511654,3.9385425 Z" id="矩形" fill="url(#linearGradient-3)" transform="translate(14.014265, 13.974749) rotate(-31.000000) translate(-14.014265, -13.974749) "></path>
                            <polygon id="Star-Copy-2" fill="#CCCCCC" transform="translate(92.522719, 17.236147) rotate(-45.000000) translate(-92.522719, -17.236147) " points="92.5220813 18.0502611 89.6421345 20.1167316 91.708605 17.2367849 89.6466466 14.3600741 92.5233575 16.4220325 95.4033042 14.355562 93.3368337 17.2355087 95.3987921 20.1122195"></polygon>
                            <rect id="Rectangle-15" fill="url(#linearGradient-4)" x="38.9204452" y="27.0957722" width="44.6488834" height="52.7892331" rx="5.14285714"></rect>
                            <polygon id="Star" fill="#CCCCCC" transform="translate(74.688006, 56.403958) rotate(-45.000000) translate(-74.688006, -56.403958) " points="74.6865095 58.3125802 71.9866898 59.1052733 72.7793829 56.4054536 71.9909211 53.7068732 74.6895015 54.4953349 77.3893212 53.7026419 76.5966282 56.4024616 77.3850899 59.101042"></polygon>
                            <polygon id="Star-Copy-3" fill="#EDEDED" transform="translate(21.980516, 41.381446) rotate(-45.000000) translate(-21.980516, -41.381446) " points="21.8885343 43.3263455 19.099931 44.2620308 20.0356163 41.4734274 19.1044431 38.5053732 22.0724974 39.4365464 24.8611007 38.5008611 23.9254154 41.2894644 24.8565886 44.2575187"></polygon>
                            <polygon id="Star-Copy-4" fill="#CCCCCC" transform="translate(24.839497, 67.404192) rotate(-45.000000) translate(-24.839497, -67.404192) " points="24.83825 68.9947108 22.5884002 69.6552883 23.2489778 67.4054386 22.5919263 65.1566216 24.8407433 65.8136731 27.0905931 65.1530955 26.4300155 67.4029453 27.087067 69.6517623"></polygon>
                            <polygon id="Star-Copy" fill="#CCCCCC" transform="translate(70.844180, 70.259998) rotate(-45.000000) translate(-70.844180, -70.259998) " points="70.8432257 71.4778356 69.1205486 71.9836302 69.6263431 70.260953 69.1232484 68.5390666 70.8451348 69.0421613 72.567812 68.5363667 72.0620174 70.2590439 72.5651121 71.9809303"></polygon>
                            <path d="M62.6771558,15.8055893 C64.3790513,15.8055893 65.7587101,17.191677 65.7587101,18.8997269 L65.7581232,19.3555893 L74.3784593,19.3563102 C76.0401385,19.3563102 77.3980447,20.6562861 77.4897176,22.2872252 L77.4946506,22.463191 C77.4946506,24.1790739 76.0981865,25.5700718 74.3784593,25.5700718 L48.1113145,25.5700718 C46.3902896,25.5700718 44.9951232,24.1755824 44.9951232,22.463191 C44.9951232,20.7473081 46.3915873,19.3563102 48.1113145,19.3563102 L56.7301232,19.3555893 L56.7310636,18.8997269 C56.7310636,17.1908819 58.1218491,15.8055893 59.812618,15.8055893 L62.6771558,15.8055893 Z" id="Combined-Shape" fill="url(#linearGradient-5)"></path>
                            <ellipse id="Oval-6" fill="url(#linearGradient-6)" cx="85.6954659" cy="75.6130442" rx="10.9344204" ry="10.9850427"></ellipse>
                            <rect id="Rectangle-19" fill="#FFFFFF" x="85.0879981" y="68.5948225" width="2.7336051" height="8.54392213" rx="1.36680255"></rect>
                            <rect id="Rectangle-19" fill="#FFFFFF" x="84.7842642" y="78.3593049" width="3.3410729" height="3.35654083" rx="1.67053645"></rect>
                            <polygon id="Line" fill="#DBDBDB" fill-rule="nonzero" points="44.3876554 39.3013752 44.3876554 36.8602546 76.8871828 36.8602546 76.8871828 39.3013752"></polygon>
                            <polygon id="Line" fill="#DBDBDB" fill-rule="nonzero" points="44.3876554 45.0990366 44.3876554 42.657916 72.9386421 42.657916 72.9386421 45.0990366"></polygon>
                            <polygon id="Line" fill="#DBDBDB" fill-rule="nonzero" points="44.3876554 51.2018381 44.3876554 48.7607175 65.0415606 48.7607175 65.0415606 51.2018381"></polygon>
                            <ellipse id="Oval-7" fill="#FFFFFF" cx="61.0930199" cy="20.0775504" rx="1.8224034" ry="1.83084046"></ellipse>
                        </g>
                    </g>
                    <path d="M25.5125347,71.8022973 L46.424788,62.7935309 C46.8606188,62.6057798 47.3746134,62.8377556 47.5728268,63.3116633 L53.6740798,77.899123 C53.8722932,78.3730307 53.6796663,78.9094112 53.2438354,79.0971623 L32.3315821,88.1059287 C31.8957512,88.2936798 31.3817567,88.061704 31.1835432,87.5877963 L25.0822903,73.0003366 C24.8840768,72.5264289 25.0767038,71.9900484 25.5125347,71.8022973 Z" id="矩形" fill="url(#linearGradient-7)"></path>
                    <path d="M34.5300458,68.2295139 L60.9847013,68.6872607 C61.536041,68.6967974 61.9751886,69.1474368 61.9657202,69.693792 L61.6693366,86.5112732 C61.6597129,87.0576284 61.2049622,87.4928058 60.6536225,87.4834229 L34.1989671,87.0256762 C33.6476273,87.0161395 33.2084797,86.5655001 33.2179482,86.0191449 L33.5143317,69.2016637 C33.5239554,68.6553085 33.9787061,68.2201311 34.5300458,68.2295139 Z" id="矩形-copy" fill="url(#linearGradient-8)"></path>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const call = (width = 24, height = 24) => {
  return (
    `
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="打电话备份">
            <rect id="BG" fill="#FFFFFF" opacity="0" x="0" y="0" width="23.9999" height="24"></rect>
            <g id="编组-11" transform="translate(2.499990, 2.500000)" fill="#666666" fill-rule="nonzero">
                <path d="M4.70265262,0.535601109 L4.56071087,0.564459231 L4.45205943,0.593714567 L4.35027658,0.62548733 L4.42128784,0.612174374 C3.50956341,0.772397114 2.71157955,1.14055384 2.07128552,1.70437718 C-0.809779457,4.24268893 0.414230395,9.59836219 4.57344834,13.9362122 C7.31048136,16.6615027 10.1993423,18.1819901 13.2423038,18.47981 C13.9967769,18.5536516 14.7572527,18.4241287 15.4448474,18.1046781 L15.8932332,17.896359 C16.7430871,17.5015185 17.4572274,16.8638864 17.9457516,16.0637339 C18.1066515,15.8001955 18.2312281,15.5557986 18.319021,15.3272711 L18.3370149,15.2746982 L18.403073,15.0515172 C18.8824853,13.4213403 17.5384862,11.5990953 15.3356949,10.6078957 C14.1460325,10.0729852 12.9092403,9.88101556 11.9107195,10.1005973 L11.7808313,10.1318773 C11.2676526,10.2664382 10.8320044,10.5138435 10.5114422,10.8580817 L10.4453734,10.9322328 L10.2722962,10.7866303 C9.90378604,10.4681708 9.54701223,10.1294266 9.2065503,9.77457795 L8.97486553,9.5276675 C8.74620156,9.27870555 8.52676517,9.02378261 8.31804269,8.76463996 L8.26497424,8.69563432 C8.56434328,8.48637627 8.81382554,8.20502029 9.00214999,7.86303309 C9.56407085,6.84149101 9.53105156,5.38473259 8.97001567,3.93240591 C8.12238571,1.73732353 6.36357761,0.247524291 4.70265262,0.535601109 Z M7.57133067,4.47344919 C7.98620725,5.5474203 8.00908034,6.55654469 7.68868006,7.13901537 C7.55316136,7.38510996 7.36865088,7.53058087 7.13002515,7.58871325 C6.86764567,7.67709815 6.7011505,7.78866817 6.58143041,8.02224169 C6.42755491,8.32131337 6.47262619,8.64654284 6.6264247,8.9913317 L6.65920585,9.0648212 L6.70681451,9.12968168 C7.13354098,9.71103985 7.61018074,10.2769807 8.12467226,10.8137136 C8.6842774,11.3969657 9.28411044,11.9405225 9.90871047,12.4300656 L9.98785206,12.4847006 C10.1839562,12.6193227 10.4078922,12.6763593 10.6289979,12.6519024 L10.7281838,12.635405 C10.9743134,12.5811996 11.1670284,12.4500683 11.3329362,12.2857858 L11.4323163,12.1873794 L11.4895798,12.059742 C11.59191,11.8316537 11.8375865,11.6531785 12.2325529,11.5663177 C12.8869959,11.4224011 13.8051624,11.5649151 14.7209591,11.9766867 C16.3215441,12.6969089 17.1872262,13.8706336 16.9645475,14.6278226 L16.9103547,14.8100183 L16.9193691,14.788738 C16.8669905,14.925081 16.7827446,15.0903563 16.6661708,15.2812929 C16.3319175,15.8287655 15.8432948,16.2650405 15.2618156,16.5351946 L14.8134335,16.743512 C14.36852,16.950215 13.8764453,17.0340242 13.3882559,16.9862443 C10.7153828,16.7246456 8.13701616,15.36758 5.64322896,12.8847518 C2.00749762,9.09257908 0.993022909,4.65372995 3.06199451,2.8308988 C3.48883383,2.45503718 4.03271437,2.20411321 4.68063767,2.09024981 L4.75096752,2.07789032 L4.86027406,2.03755661 L4.90452872,2.02509013 C5.71209841,1.84764458 6.87052304,2.78349647 7.51421915,4.33100314 L7.57133067,4.47344919 Z" id="icon"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const locationIcon = (width = 24, height = 24) => {
  return (
    `<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>定位备份</title>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="定位备份">
            <rect id="BG" fill="#FFFFFF" opacity="0" x="0" y="0" width="23.9999" height="24"></rect>
            <g id="地址轮廓" transform="translate(4.200000, 1.800000)" fill="#666666" fill-rule="nonzero">
                <path d="M8.09997179,0 C12.9409436,0 16.165098,3.845037 16.1997731,8.03154953 C16.2285052,11.500529 13.5285714,15.4233458 8.09997179,19.8 L7.6091806,19.3819315 L7.13372663,18.9674161 C2.37790888,14.7712385 0,11.1259496 0,8.03154953 C0,3.84484237 3.25900003,0 8.09997179,0 Z M8.09997179,1.485 C4.33054154,1.485 1.51875,4.42487333 1.51875,8.03154953 C1.51875,10.5693601 3.62356781,13.8257167 7.94476891,17.6817061 L8.12025,17.83683 L8.30044749,17.6837072 C12.5442316,14.0350779 14.6307494,10.8387676 14.6803429,8.18286055 L14.6810729,8.04357543 C14.6510102,4.41393961 11.8583574,1.485 8.09997179,1.485 Z" id="Shape"></path>
                <path d="M8.1,4.455 C10.0571591,4.455 11.64375,6.00633334 11.64375,7.92 C11.64375,9.83366666 10.0571591,11.385 8.1,11.385 C6.14284092,11.385 4.55625,9.83366666 4.55625,7.92 C4.55625,6.00633334 6.14284092,4.455 8.1,4.455 Z M8.1,5.94 C6.98162338,5.94 6.075,6.8264762 6.075,7.92 C6.075,9.0135238 6.98162338,9.9 8.1,9.9 C9.21837662,9.9 10.125,9.0135238 10.125,7.92 C10.125,6.8264762 9.21837662,5.94 8.1,5.94 Z" id="Path"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const weighticon = () => {
  return (
    `
    <svg width="25px" height="24px" viewBox="0 0 25 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>重量</title>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="手动发单-发配送" transform="translate(-34.000000, -904.000000)">
            <g id="编组-18" transform="translate(0.000000, 100.000000)">
                <g id="编组-22" transform="translate(0.000000, 790.000000)">
                    <g id="编组-13" transform="translate(16.000000, 10.000000)">
                        <g id="重量" transform="translate(18.000000, 4.000000)">
                            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0.094" y="0" width="24" height="24"></rect>
                            <g id="编组-23" transform="translate(3.094000, 3.000000)" fill="#666666" fill-rule="nonzero">
                                <path d="M15.1933336,1.43559128 C15.9829088,1.43559128 16.6289248,2.08160736 16.6289248,2.87118256 L16.6289248,15.1933336 C16.6289248,15.9829088 15.9829088,16.6289248 15.1933336,16.6289248 L2.87118256,16.6289248 C2.08160736,16.6289248 1.43559128,15.9829088 1.43559128,15.1933336 L1.43559128,2.87118256 C1.43559128,2.08160736 2.08160736,1.43559128 2.87118256,1.43559128 L15.1933336,1.43559128 M15.1933336,0 L2.87118256,0 C1.2872476,0 0,1.2872476 0,2.87118256 L0,15.1933336 C0,16.7772685 1.2872476,18.0645161 2.87118256,18.0645161 L15.1933336,18.0645161 C16.7772685,18.0645161 18.0645161,16.7772685 18.0645161,15.1933336 L18.0645161,2.87118256 C18.0645161,1.2824608 16.7772685,0 15.1933336,0 Z" id="形状"></path>
                                <path d="M14.791368,10.819558 C14.394187,10.819558 14.0735724,10.4989434 14.0735724,10.1017624 C14.0735724,7.3214931 11.810116,5.06283696 9.03464698,5.06283696 C6.25917798,5.06283696 3.99572159,7.32151553 3.99572159,10.1017624 C3.99572159,10.4989434 3.67510695,10.819558 3.27792595,10.819558 C2.88074494,10.819558 2.56013031,10.4989434 2.56013031,10.1017624 C2.56013031,6.53191789 5.46480252,3.62724568 9.03464698,3.62724568 C12.6044914,3.62724568 15.5091637,6.53191789 15.5091637,10.1017624 C15.5091637,10.4989434 15.188549,10.819558 14.791368,10.819558 Z" id="路径"></path>
                                <path d="M7.68040662,13.1500161 C7.68040662,13.8979449 8.28672269,14.504261 9.03465146,14.504261 C9.78258024,14.504261 10.3888963,13.8979449 10.3888963,13.1500161 C10.3888963,12.4020873 9.78258024,11.7957713 9.03465146,11.7957713 C8.28672269,11.7957713 7.68040662,12.4020873 7.68040662,13.1500161 L7.68040662,13.1500161 Z" id="路径"></path>
                                <path d="M9.25956376,13.6285391 C9.13514577,13.6285391 9.01551324,13.5806861 8.91980641,13.4897652 C8.83021207,13.4003544 8.77986304,13.2789771 8.77986304,13.1524012 C8.77986304,13.0258254 8.83021207,12.9044481 8.91980641,12.8150373 L12.082885,9.65195863 C12.2034136,9.5314301 12.3790877,9.48435835 12.5437328,9.52847485 C12.7083778,9.57259136 12.8369802,9.70119377 12.8810967,9.86583881 C12.9252132,10.0304838 12.8781415,10.206158 12.7576129,10.3266865 L9.59453431,13.4897652 C9.5036136,13.5806859 9.37919561,13.6285391 9.25956376,13.6285391 L9.25956376,13.6285391 Z" id="路径"></path>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const time = () => {
  return (
    `
   <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>时间</title>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="手动发单-发配送" transform="translate(-104.000000, -904.000000)">
            <g id="编组-18" transform="translate(0.000000, 100.000000)">
                <g id="编组-22" transform="translate(0.000000, 790.000000)">
                    <g id="编组-15" transform="translate(88.000000, 10.000000)">
                        <rect id="矩形" stroke="#E5E5E5" stroke-width="0.5" x="0.25" y="0.25" width="55.5" height="55.5" rx="3.61290323"></rect>
                        <g id="时间" transform="translate(16.000000, 4.000000)">
                            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="24" height="24"></rect>
                            <g id="编组-24" transform="translate(3.000000, 3.000000)" fill="#515151" fill-rule="nonzero">
                                <path d="M9.03225806,18.0645161 C7.81356816,18.0645161 6.62976026,17.8246734 5.51789649,17.3537096 C4.44309484,16.8980084 3.47729945,16.2482528 2.64667181,15.4175249 C1.81822429,14.5889774 1.1663669,13.6230654 0.710720765,12.5459536 C0.239813755,11.4317753 0,10.2500049 0,9.03116787 C0,7.81233087 0.239813755,6.62838009 0.710720765,5.51638211 C1.1663669,4.44145074 1.81604416,3.47553877 2.64667181,2.64481087 C3.47511932,1.81626336 4.44091472,1.16432729 5.51789649,0.708626161 C6.63194039,0.237662312 7.81356816,0 9.03225806,0 C10.250948,0 11.4347559,0.239842701 12.5466196,0.710806549 C13.6214213,1.16650768 14.5872167,1.81626336 15.4178443,2.64699126 C16.2462918,3.47553877 16.8981492,4.44145074 17.3537954,5.5185625 C17.8247024,6.63274086 18.0645161,7.81451126 18.0645161,9.03334826 C18.0645161,10.2521853 17.8247024,11.436136 17.3537954,12.548134 C16.8981492,13.6230654 16.248472,14.5889774 15.4178443,15.4197053 C14.5872167,16.2504332 13.6236014,16.9001888 12.5466196,17.35589 C11.4347559,17.8246734 10.250948,18.0645161 9.03225806,18.0645161 Z M9.03225806,1.30823291 C4.77447385,1.30823291 1.31025515,4.77286974 1.31025515,9.03116787 C1.31025515,13.289466 4.77447385,16.7562832 9.03225806,16.7562832 C13.2900423,16.7562832 16.754261,13.2916464 16.754261,9.03334826 C16.754261,4.77505013 13.2922224,1.30823291 9.03225806,1.30823291 Z" id="形状"></path>
                                <path d="M11.8402591,13.171725 C11.6723895,13.171725 11.5067,13.1084938 11.3780726,12.9798509 L8.58751256,10.1911344 C8.46542555,10.0690326 8.39566155,9.90114276 8.39566155,9.72889209 L8.39566155,4.14273756 C8.39566155,3.78079312 8.68779831,3.4886211 9.04969906,3.4886211 C9.41159982,3.4886211 9.70373658,3.78079312 9.70373658,4.14273756 L9.70373658,9.45852396 L12.3024456,12.0553663 C12.5575203,12.3104717 12.5575203,12.7247455 12.3024456,12.9798509 C12.1759984,13.1084938 12.0081288,13.171725 11.8402591,13.171725 L11.8402591,13.171725 Z" id="路径"></path>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const cost = () => {
  return (
    `
   <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>费用</title>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="手动发单-发配送" transform="translate(-176.000000, -904.000000)">
            <g id="编组-18" transform="translate(0.000000, 100.000000)">
                <g id="编组-22" transform="translate(0.000000, 790.000000)">
                    <g id="编组-16" transform="translate(160.000000, 10.000000)">
                        <g id="费用" transform="translate(16.000000, 4.000000)">
                            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="24" height="24"></rect>
                            <g id="编组-28" transform="translate(3.000000, 2.000000)" fill="#666666">
                                <path d="M12.1935484,13.1465456 C12.1935484,13.399673 11.9883481,13.6048732 11.7352208,13.6048732 L9.2298294,13.6048732 L9.2298294,13.6048732 L9.2298294,15.9314526 C9.2298294,16.1652823 9.040273,16.3548387 8.80644334,16.3548387 C8.57261367,16.3548387 8.38305727,16.1652823 8.38305727,15.9314526 L8.38305727,13.6048732 L8.38305727,13.6048732 L5.87768242,13.6048732 C5.62455509,13.6048732 5.41935484,13.399673 5.41935484,13.1465456 C5.41935484,12.8934183 5.62455509,12.6882181 5.87768242,12.6882181 L8.38305727,12.6882181 L8.38305727,12.6882181 L8.38305727,11.3132353 L5.87768242,11.3132353 C5.62455509,11.3132353 5.41935484,11.1080351 5.41935484,10.8549077 C5.41935484,10.6017804 5.62455509,10.3965801 5.87768242,10.3965801 L8.04942574,10.3965801 L8.04942574,10.3965801 L6.39194231,8.25834507 C6.2403905,8.06283579 6.26471113,7.78364811 6.44778606,7.61728886 C6.61341848,7.46677954 6.869702,7.47903923 7.02021133,7.64467165 C7.02731499,7.65248909 7.03411028,7.66058129 7.04058162,7.66892971 L8.7996791,9.93827047 L8.7996791,9.93827047 L8.81324068,9.93827047 L10.5723837,7.66892653 C10.7094994,7.49204342 10.9640457,7.45980557 11.1409288,7.59692126 C11.149276,7.6033918 11.157367,7.61018619 11.1651833,7.61728886 C11.3482568,7.78364681 11.3725733,8.06283391 11.221017,8.25833726 L9.56342787,10.3965801 L9.56342787,10.3965801 L11.7352208,10.3965801 C11.9883481,10.3965801 12.1935484,10.6017804 12.1935484,10.8549077 C12.1935484,11.1080351 11.9883481,11.3132353 11.7352208,11.3132353 L9.22984595,11.3132353 L9.22984595,11.3132353 L9.22984595,12.6882181 L11.7352208,12.6882181 C11.9883481,12.6882181 12.1935484,12.8934183 12.1935484,13.1465456 Z" id="路径" stroke="#666666" stroke-width="0.5"></path>
                                <path d="M17.8769542,11.09129 L17.8649755,11.0434443 C17.3283309,9.17507148 16.4323261,7.588988 15.2009183,6.33303955 C14.6642737,5.78520679 14.055757,5.29478883 13.3921385,4.87853162 C13.2579773,4.79240944 13.2148541,4.6177728 13.2963091,4.47662812 C13.6197333,3.91683395 13.749103,3.299625 13.6940011,2.58911701 C13.6820224,2.45036461 13.6532736,2.32596591 13.6053589,2.20635177 C13.2388114,1.27814605 12.3883255,0.608306879 11.1425434,0.266210443 C10.3471594,0.0485127108 9.5661498,0.0102361865 9.16606207,0.00784390369 C9.15887486,0.00784390369 9.14929192,0.00784390369 9.13970898,0.00545162092 C9.11096017,0.00305933815 9.08221135,0.00066705538 9.05106679,0.00066705538 C8.18141502,-0.0112943585 5.2849715,0.115496628 4.45604722,2.22309775 C4.41052826,2.34271189 4.38417518,2.46471831 4.3721965,2.58911701 C4.3170946,3.299625 4.44886002,3.91922623 4.77228423,4.4790204 C4.85373922,4.62016508 4.81061599,4.79719401 4.67645484,4.88092391 C4.01283626,5.29957339 3.4043196,5.79238364 2.86527924,6.34260868 C1.63147576,7.60573398 0.730679429,9.20138659 0.191639073,11.09129 L0.182056134,11.1295665 C-0.29229938,13.3328589 0.167681724,15.4213218 1.47575299,17.0097975 C2.55143797,18.3135917 4.68603778,19.8709677 8.75159993,19.8709677 C8.84263785,19.8709677 8.93846725,19.8709677 9.02471371,19.8685755 C9.12054311,19.8709677 9.2163725,19.8709677 9.30741043,19.8709677 C13.3729726,19.8709677 15.5099681,18.3159839 16.5832574,17.0121898 C17.9009116,15.4237141 18.3608927,13.3208975 17.8769542,11.09129 L17.8769542,11.09129 Z M6.84459493,5.00771489 C6.87573949,4.7565252 6.77511862,4.51251236 6.58106409,4.35222941 C6.01806639,3.89291112 5.7856801,3.39053174 5.83119907,2.72786941 C6.30795031,1.57239684 8.34672073,1.46713639 8.96482034,1.46235183 L8.98877768,1.46235183 C9.0175265,1.46474411 9.04627532,1.46713639 9.1061687,1.46713639 C9.54219245,1.46713639 11.7318942,1.52694346 12.2349985,2.72069256 C12.2805175,3.39053174 12.0481312,3.89291112 11.4875292,4.35222941 C11.2910789,4.51251236 11.1928538,4.7565252 11.2239984,5.00771489 C11.2551429,5.25890458 11.4084699,5.47181775 11.6384605,5.57947047 C14.0341954,6.71580479 15.6513165,8.67747666 16.4467005,11.4118559 L16.4538877,11.438171 C16.8276223,13.2060679 16.4730536,14.8543508 15.457262,16.0815918 C14.5828187,17.1437654 12.8051834,18.409283 9.30980616,18.409283 C9.22355971,18.409283 9.13491751,18.409283 9.04627532,18.4068907 L8.98638195,18.4068907 C8.90971843,18.409283 8.83305492,18.4116753 8.75159993,18.409283 C5.25861842,18.409283 3.48098311,17.1437654 2.60653987,16.0815918 C1.59793547,14.8543508 1.24097097,13.2180294 1.60751841,11.4764475 L1.61470561,11.4501324 C2.41248534,8.69661492 4.03439788,6.72298164 6.43252853,5.58425504 C6.66012335,5.47421003 6.81584612,5.25890458 6.84459493,5.00771489 Z" id="形状" fill-rule="nonzero"></path>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const add_tip = () => {
  return (
    `
   <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>加小费</title>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="手动发单-发配送" transform="translate(-247.000000, -904.000000)">
            <g id="编组-18" transform="translate(0.000000, 100.000000)">
                <g id="编组-22" transform="translate(0.000000, 790.000000)">
                    <g id="编组-17" transform="translate(231.000000, 10.000000)">
                        <g id="账单费用明细" transform="translate(16.000000, 4.000000)">
                            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="24" height="24"></rect>
                            <path d="M20.3549878,8.51734984 C20.4038539,8.63249382 20.4403712,8.75356525 20.4846505,8.87096731 L19.523559,8.87096731 C18.2902817,5.95175765 15.4003917,3.90322846 12.0322669,3.90322846 C7.5427628,3.90322846 3.90322844,7.54276281 3.90322844,12.0322669 L3.90321284,12.0324845 C3.88533729,12.2818956 3.66865869,12.4695922 3.41924765,12.4517166 C3.19463262,12.4356182 3.01599016,12.2568897 3,12.0322669 L3,12.0322669 L3,12.0322669 C3,7.04374673 7.04374673,3 12.0322669,3 C15.2545168,3 18.0743536,4.69217734 19.6731738,7.23118427 L19.9517281,5.65185756 C19.9951254,5.40620413 20.2294885,5.24228226 20.4751419,5.28562666 C20.7203543,5.32898868 20.8847701,5.5628931 20.8413728,5.80859945 L20.3708825,8.47718086 C20.3681305,8.49208768 20.3590629,8.50337803 20.3549878,8.51734984 Z M15.6451807,13.8387238 C15.6451807,14.0881435 15.4429861,14.290338 15.1935665,14.290338 L12.4838635,14.290338 L12.4838635,14.290338 L12.4838635,16.5484092 C12.4838635,16.7978288 12.2816689,17.0000234 12.0322492,17.0000234 C11.7828296,17.0000234 11.580635,16.7978288 11.580635,16.5484092 L11.580635,14.290338 L11.580635,14.290338 L8.87094964,14.290338 C8.62152998,14.290338 8.41933541,14.0881435 8.41933541,13.8387238 C8.41933541,13.5893042 8.62152998,13.3871096 8.87094964,13.3871096 L11.580635,13.3871096 L11.580635,13.3871096 L11.580635,12.0322669 L8.87094964,12.0322669 C8.62152998,12.0322669 8.41933541,11.8300723 8.41933541,11.5806527 C8.41933541,11.331233 8.62152998,11.1290384 8.87094964,11.1290384 L11.2247595,11.1290384 L11.2247595,11.1290384 L9.46072548,9.02683975 C9.30037046,8.83574472 9.32526603,8.55084336 9.51633461,8.39045683 C9.70736169,8.23010514 9.99221046,8.25497245 10.1525622,8.44599953 C10.1525785,8.44601901 10.1525949,8.44603848 10.1526112,8.44605796 L12.025034,10.6774419 L12.025034,10.6774419 L12.0394998,10.6774419 L13.9119713,8.44605447 C14.072295,8.25499993 14.3571433,8.23008763 14.5481978,8.39041129 C14.5482159,8.39042647 14.548234,8.39044165 14.5482521,8.39045683 C14.739319,8.55084197 14.7642103,8.83574253 14.603851,9.02683115 L12.8397037,11.1290384 L12.8397037,11.1290384 L15.1935665,11.1290384 C15.4429861,11.1290384 15.6451807,11.331233 15.6451807,11.5806527 C15.6451807,11.8300723 15.4429861,12.0322669 15.1935665,12.0322669 L12.4838811,12.0322669 L12.4838811,12.0322669 L12.4838811,13.3871096 L15.1935665,13.3871096 C15.4429861,13.3871096 15.6451807,13.5893042 15.6451807,13.8387238 Z M3.70947536,15.5471663 C3.66069749,15.4320576 3.62414497,15.3109509 3.5798656,15.1935488 L4.5409042,15.1935488 C5.77423442,18.1128114 8.66412444,20.1612877 12.0322492,20.1612877 C16.5217357,20.1612877 20.1612877,16.5217357 20.1612877,12.0322492 L20.161427,12.0296165 C20.174623,11.7802716 20.3874544,11.5888352 20.6367992,11.6020312 C20.8687043,11.6143043 21.0535954,11.8002766 21.0645161,12.0322492 L21.0645161,12.0322492 L21.0645161,12.0322492 C21.0645161,17.0208047 17.0208223,21.0645073 12.0322492,21.0645073 C8.81044041,21.0645073 5.99010956,19.3723741 4.39139521,16.8332966 L4.11275276,18.4127115 C4.06940838,18.6582767 3.83504528,18.8222515 3.58933892,18.7789424 C3.34412651,18.7355451 3.17976362,18.501623 3.22310802,18.2558814 L3.69368652,15.5873 C3.69638561,15.5724814 3.70541788,15.5611911 3.70947536,15.5471663 Z" id="形状" stroke="#666666" stroke-width="0.5" fill="#666666" fill-rule="nonzero"></path>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const remarkIcon = () => {
  return (
    `
   <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>备注</title>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="手动发单-发配送" transform="translate(-319.000000, -904.000000)">
            <g id="编组-18" transform="translate(0.000000, 100.000000)">
                <g id="编组-22" transform="translate(0.000000, 790.000000)">
                    <g id="编组-20" transform="translate(303.000000, 10.000000)">
                        <g id="编组-19" transform="translate(16.000000, 4.000000)">
                            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="24" height="24"></rect>
                            <g id="编组-25" transform="translate(3.000000, 3.000000)" fill="#666666" fill-rule="nonzero">
                                <path d="M16.8489975,0.681255566 L16.9316477,0.763905725 C17.3078947,1.14015278 17.3078947,1.7501698 16.9316477,2.12641686 L8.94193548,10.116129 L8.94193548,10.116129 L6.77419355,10.8387097 L7.49677419,8.67096774 L15.4864864,0.681255566 C15.8627334,0.305008506 16.4727504,0.305008506 16.8489975,0.681255566 Z" id="路径"></path>
                                <path d="M15.655914,16.5565524 L1.50796371,16.5591398 L1.50537634,2.41118952 L10.9892473,2.4087924 C11.4049763,2.40868732 11.7419355,2.07164295 11.7419355,1.65591398 C11.7419355,1.24021578 11.4049455,0.903225806 10.9892473,0.903225806 L1.50537634,0.903225806 L1.50537634,0.903225806 C0.674998663,0.905680077 0.0024542707,1.57822447 0,2.40860215 L0,16.5591398 C0.0024542707,17.3895175 0.674998663,18.0620619 1.50537634,18.0645161 L15.655914,18.0645161 C16.4862917,18.0620619 17.1588361,17.3895175 17.1612903,16.5591398 L17.1612903,7.07526882 C17.1612903,6.65957062 16.8243003,6.32258065 16.4086022,6.32258065 C15.992904,6.32258065 15.655914,6.65957062 15.655914,7.07526882 L15.655914,16.5565524 L15.655914,16.5565524 Z" id="路径"></path>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
    </svg>
    `
  )
}


export const order_search = () => {
  return (
    `
   <svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>订单查询@2x</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="30" height="30"></rect>
        <g id="编组-9" transform="translate(3.000000, 4.000000)" fill-rule="nonzero">
            <path d="M15.4699441,5.14285714 C15.4699441,4.66875 15.0864804,4.28571429 14.6145251,4.28571429 L4.33340782,4.28571429 C3.86145251,4.28571429 3.47798883,4.66875 3.47798883,5.14285714 C3.47798883,5.61696429 3.86145251,6 4.33340782,6 L14.6145251,6 C15.0864804,6 15.4699441,5.61696429 15.4699441,5.14285714 Z" id="路径" fill="#333333"></path>
            <path d="M23.1268734,22 C22.8934904,22 22.6738359,21.9079138 22.5090951,21.7404844 L20.3537353,19.5499498 L20.2082142,19.5359973 L20.1917401,19.5471593 C19.3213591,20.1499051 18.305457,20.468021 17.2538611,20.468021 C14.3654044,20.468021 12.0151012,18.0793615 12.0151012,15.143766 C12.0151012,12.2081706 14.3654044,9.81951111 17.2538611,9.81951111 C20.1423178,9.81951111 22.492621,12.2081706 22.492621,15.143766 C22.492621,16.2097332 22.1796133,17.2422145 21.5865462,18.1295904 L21.5755634,18.1463333 L21.5892918,18.2942293 L23.7446516,20.4847639 C23.9093925,20.6521933 24,20.8754325 24,21.1126242 C24,21.3498158 23.9066468,21.573055 23.741906,21.7404844 C23.5799108,21.9079138 23.3602563,22 23.1268734,22 L23.1268734,22 Z M17.2566068,11.5942628 C15.3318842,11.5942628 13.7641002,13.1876325 13.7641002,15.143766 C13.7641002,17.0998995 15.3318842,18.6932693 17.2566068,18.6932693 C19.1813294,18.6932693 20.7491134,17.0998995 20.7491134,15.143766 C20.7491134,13.1876325 19.184075,11.5942628 17.2566068,11.5942628 Z" id="形状备份" fill="#26B942"></path>
            <path d="M12.7269274,10.2857143 C12.7269274,9.81160714 12.3434637,9.42857143 11.8715084,9.42857143 L4.33340782,9.42857143 C3.86145251,9.42857143 3.47798883,9.81160714 3.47798883,10.2857143 C3.47798883,10.7598214 3.86145251,11.1428571 4.33340782,11.1428571 L11.8715084,11.1428571 C12.3434637,11.1428571 12.7269274,10.7598214 12.7269274,10.2857143 Z" id="路径" fill="#333333"></path>
            <path d="M4.33340782,14.5714286 C3.86145251,14.5714286 3.47798883,14.9544643 3.47798883,15.4285714 C3.47798883,15.9026786 3.86145251,16.2857143 4.33340782,16.2857143 L9.47396648,16.2857143 C9.94592179,16.2857143 10.3293855,15.9026786 10.3293855,15.4285714 C10.3293855,14.9544643 9.94592179,14.5714286 9.47396648,14.5714286 L4.33340782,14.5714286 Z" id="路径" fill="#333333"></path>
            <path d="M11.8795531,20.5714286 L2.56625698,20.5714286 C2.09430168,20.5714286 1.71083799,20.1883929 1.71083799,19.7142857 L1.71083799,2.57142857 C1.71083799,2.09732143 2.09430168,1.71428571 2.56625698,1.71428571 L18.3387709,1.71428571 C18.8107263,1.71428571 19.1941899,2.09732143 19.1941899,2.57142857 L19.1941899,8.42857143 C19.1941899,8.90267857 19.5776536,9.28571429 20.0496089,9.28571429 C20.5215642,9.28571429 20.9050279,8.90267857 20.9050279,8.42857143 L20.9050279,1.71428571 C20.9050279,0.76875 20.1381006,0 19.1941899,0 L1.71083799,0 C0.766927374,0 7.10542736e-15,0.76875 7.10542736e-15,1.71428571 L7.10542736e-15,20.5714286 C7.10542736e-15,21.5169643 0.766927374,22.2857143 1.71083799,22.2857143 L11.8795531,22.2857143 C12.3515084,22.2857143 12.7349721,21.9026786 12.7349721,21.4285714 C12.7349721,20.9544643 12.3541899,20.5714286 11.8795531,20.5714286 Z" id="路径" fill="#333333"></path>
        </g>
    </g>
</svg>
    `
  )
}


export const operator_data = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>数据看板@1x</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="数据看板">
            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="30" height="30"></rect>
            <g id="编组-10" transform="translate(3.000000, 3.000000)" fill-rule="nonzero">
                <path d="M22.9446853,1.69839234 L18.5732506,2.69067243 C18.2353211,2.76723139 17.9650414,3.01647549 17.8662159,3.34359958 L17.8378154,3.46748974 C17.7917553,3.75826214 17.8860547,4.05656378 18.0977284,4.27128922 L18.958,5.144 L14.045,9.437 L11.4815048,7.05808539 C11.0963899,6.70093887 10.4900153,6.71609649 10.1239272,7.09208427 L5.02510812,12.3303022 C4.67144979,12.6936294 4.67928792,13.2748609 5.04261507,13.6285192 L5.07198306,13.6558414 L5.16780207,13.7310183 C5.56401941,14.0050161 6.10594552,13.9588963 6.44844125,13.6070249 L10.854,9.08 L13.3647323,11.4092856 L13.4595317,11.486651 C13.8208755,11.7451927 14.3242351,11.7271565 14.6663586,11.428198 L20.3,6.504 L21.3046358,7.5241429 C21.5456626,7.76865652 21.9016595,7.86709686 22.2369555,7.78228977 C22.5727786,7.69734936 22.8365076,7.44154743 22.9269172,7.11215724 L24.0914722,2.8661701 C24.1330287,2.71602253 24.1360256,2.55779447 24.1001143,2.40594605 C23.9794718,1.89682543 23.4620657,1.58084056 22.9446853,1.69839234 Z" id="路径" fill="#333333"></path>
                <path d="M16.4185446,-0.125 L2.51522411,-0.125 C1.05763455,-0.125 -0.125,1.0336838 -0.125,2.46428571 L-0.125,17.25 C-0.125,18.6806019 1.05763455,19.8392857 2.51522411,19.8392857 L20.9602009,19.8392857 C22.4177904,19.8392857 23.600425,18.6806019 23.600425,17.25 L23.600425,10.7418214 C23.600425,10.2185445 23.1685266,9.79539286 22.637017,9.79539286 C22.1055073,9.79539286 21.6736089,10.2185445 21.6736089,10.7418214 L21.6736089,17.25 C21.6736089,17.634048 21.3547712,17.9464286 20.9602009,17.9464286 L2.51522411,17.9464286 C2.12065378,17.9464286 1.80181607,17.634048 1.80181607,17.25 L1.80181607,2.46428571 C1.80181607,2.08023774 2.12065378,1.76785714 2.51522411,1.76785714 L16.4185446,1.76785714 C16.9500542,1.76785714 17.3819526,1.34470554 17.3819526,0.821428571 C17.3819526,0.298151601 16.9500542,-0.125 16.4185446,-0.125 Z" id="形状" fill="#333333"></path>
                <path d="M22.2178129,22.2321429 L1.25761205,22.2321429 C0.726102438,22.2321429 0.294204018,22.6552945 0.294204018,23.1785714 C0.294204018,23.7018484 0.726102438,24.125 1.25761205,24.125 L22.2178129,24.125 C22.7493226,24.125 23.181221,23.7018484 23.181221,23.1785714 C23.181221,22.6552945 22.7493226,22.2321429 22.2178129,22.2321429 Z" id="路径" fill="#26B942"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const delivery_sync = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>配送回传@1x</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="配送回传">
            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="30" height="30"></rect>
            <g id="编组-11" transform="translate(3.000000, 4.000000)" fill-rule="nonzero">
                <path d="M2.74513528,10.2409344 L8.44077819,13.6679421 C8.71117618,13.8215197 8.87647748,14.1087789 8.87255227,14.4182756 C8.86862707,14.7277723 8.69609308,15.0107996 8.42188611,15.157555 C8.14767913,15.3043104 7.81495228,15.2916984 7.55278932,15.124612 L0.413735928,10.8304172 C0.13733113,10.6643649 -0.0216850777,10.3579924 0.0023940258,10.0378952 C0.0264731293,9.71779798 0.229558809,9.43832991 0.5277345,9.31496936 L22.8131695,0.0655412383 C23.1042253,-0.0549892226 23.4383663,-0.00696975379 23.6831446,0.190565537 C23.927923,0.388100829 24.0438096,0.70325218 23.9848691,1.01109891 L20.0806323,21.4555891 C20.0276705,21.7328569 19.8399732,21.9660576 19.5794289,22.078299 C19.3188847,22.1905403 19.0193187,22.1672506 18.7795058,22.0161089 L11.5418822,17.4552839 C11.1418752,17.2035847 11.0229124,16.6772693 11.2761712,16.2797257 C11.5294301,15.8821821 12.0590066,15.7639518 12.4590135,16.015651 L18.632079,19.9052153 L22.0031796,2.24884242 L2.74513528,10.2409344 Z" id="路径" fill="#333333"></path>
                <path d="M9.42905152,15.1229083 L9.42905152,22.1481462 C9.42905152,22.6186121 9.0453004,23 8.5719194,23 C8.0985384,23 7.71478728,22.6186121 7.71478728,22.1481462 L7.71478728,14.7310556 C7.71478728,14.4820486 7.82438212,14.2455012 8.01478353,14.0836467 L18.4340815,5.21755277 C18.6668116,5.01973305 18.9880526,4.96033552 19.2767961,5.06173466 C19.5655396,5.16313379 19.7779186,5.40992465 19.833932,5.70914351 C19.8899453,6.00836237 19.7810834,6.31455077 19.5483533,6.51237049 L9.42905152,15.1220564 L9.42905152,15.1229083 Z" id="路径" fill="#26B942"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const adjust = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>调价</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="调价">
            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="30" height="30"></rect>
            <g id="编组-12" transform="translate(3.000000, 3.000000)" fill-rule="nonzero">
                <path d="M23.4449598,11.1787623 C23.7905667,11.1970527 24.0850801,11.4216789 24.2023524,11.7529574 L24.2347057,11.8671969 L24.25,11.9999883 C24.25,18.7657257 18.7657302,24.25 11.9999883,24.25 C8.09277254,24.25 4.50541662,22.3999006 2.21742759,19.3545259 L1.986,19.035 L1.72456581,20.5203535 C1.65553086,20.9114674 1.32913993,21.1925788 0.95013109,21.2204257 L0.84561429,21.2216334 L0.739411273,21.2096367 C0.313045107,21.1341791 0.0171099298,20.7529633 0.0382223116,20.3312432 L0.0502135603,20.2251228 L0.675,16.676 L0.536477096,16.2882322 L0.408912697,15.9500085 L2.21297694,15.9500085 L2.27749242,16.1027151 C3.91473572,19.978032 7.72024477,22.5500076 11.9999883,22.5500076 C17.7310044,22.5500076 22.394832,17.9801272 22.5465367,12.2730612 L22.5503458,11.9867761 L22.5626432,11.8798237 C22.6373738,11.4609914 23.0118976,11.1558434 23.4449598,11.1787623 Z M12.0000117,-0.25 C15.9074991,-0.25 19.4944177,1.59992273 21.7825763,4.64539654 L22.013,4.964 L22.2753937,3.47969222 C22.3444995,3.08851395 22.6708904,2.80742243 23.0498314,2.77962235 L23.154328,2.77842806 L23.2605075,2.79043922 C23.6869118,2.86584226 23.9829274,3.24707435 23.9617512,3.66873129 L23.949741,3.77483413 L23.324,7.322 L23.4635229,7.71177959 L23.5910873,8.05000324 L21.7869512,8.05000324 L21.7224364,7.89729455 C20.0852529,4.02202311 16.2797277,1.45000411 12.0000117,1.45000411 C6.26897338,1.45000411 1.60516725,6.01986102 1.45318708,11.7313781 L1.44936387,12.0178895 L1.43510607,12.1240165 C1.35266465,12.5392783 0.972123928,12.8376801 0.539128554,12.8066469 C0.204336415,12.782652 -0.0801084582,12.5653664 -0.198926754,12.2452852 L-0.232240402,12.1349083 L-0.25,12.0000176 C-0.25,5.23433783 5.23433515,-0.25 12.0000117,-0.25 Z" id="形状" fill="#333333"></path>
                <path d="M12,9.823 L9.69426306,7.07478015 L9.60233056,6.98184544 C9.27159321,6.70592255 8.81266809,6.70488569 8.49668319,6.97012944 L8.41332229,7.05023489 C8.13170749,7.36011174 8.11539096,7.83812404 8.39202768,8.16779209 L10.391,10.55 L7.79997624,10.5500135 C7.33053306,10.5500135 6.94997418,10.9305724 6.94997418,11.4000155 L6.9565969,11.506638 C7.00904764,11.9257544 7.36664408,12.2500176 7.79997624,12.2500176 L11.149,12.25 L11.149,13.55 L7.79997624,13.5500237 C7.33053306,13.5500237 6.94997418,13.9305826 6.94997418,14.4000258 L6.9565969,14.5066483 C7.00904764,14.9257647 7.36664408,15.2500279 7.79997624,15.2500279 L11.149,15.25 L11.1499865,18.0000384 C11.1499865,18.4694814 11.5305452,18.8500402 11.9999883,18.8500402 L12.1066107,18.8434174 C12.5257269,18.7909667 12.84999,18.4333704 12.84999,18.0000384 L12.849,15.25 L16.2000237,15.2500279 C16.6694669,15.2500279 17.0500258,14.869469 17.0500258,14.4000258 L17.0434031,14.2934033 C16.9909523,13.8742869 16.6333559,13.5500237 16.2000237,13.5500237 L12.85,13.55 L12.85,12.25 L16.2000237,12.2500176 C16.6694669,12.2500176 17.0500258,11.8694587 17.0500258,11.4000155 L17.0434031,11.2933931 C16.9909523,10.8742767 16.6333559,10.5500135 16.2000237,10.5500135 L13.608,10.55 L15.6080477,8.16778634 C15.9098439,7.80815739 15.8629985,7.27197444 15.5034106,6.97012944 L15.3776968,6.88250218 C15.0231774,6.68017113 14.5710234,6.75874387 14.3058271,7.0747732 L12,9.823 Z" id="路径" fill="#24B942"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const order_compensate = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>订单补偿</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="订单补偿" fill-rule="nonzero">
            <rect id="矩形" opacity="0.300000012" x="0" y="0" width="30" height="30"></rect>
            <g id="i" transform="translate(5.000000, 3.999336)">
                <path d="M19,0.000663920376 C20.1045695,0.000663920376 21,0.896094421 21,2.00066392 L21,20.5006639 C21,21.6052334 20.1045695,22.5006639 19,22.5006639 L2,22.5006639 C0.8954305,22.5006639 0,21.6052334 0,20.5006639 L0,2.00066392 C0,0.896094421 0.8954305,0.000663920376 2,0.000663920376 L5.36089763,-0.000493882301 C5.26390412,0.273514797 5.21112061,0.568425234 5.21112061,0.87566392 C5.21112061,1.18252838 5.26377561,1.47709461 5.36054341,1.75082038 L2,1.75066392 C1.88165327,1.75066392 1.78251318,1.83289733 1.75660268,1.94334121 L1.75,2.00066392 L1.75,20.5006639 C1.75,20.6190107 1.83223341,20.7181507 1.94267729,20.7440612 L2,20.7506639 L19,20.7506639 C19.1183467,20.7506639 19.2174868,20.6684305 19.2433973,20.5579866 L19.25,20.5006639 L19.25,2.00066392 C19.25,1.88231719 19.1677666,1.7831771 19.0573227,1.7572666 L19,1.75066392 L15.5616978,1.75082038 C15.6584656,1.47709461 15.7111206,1.18252838 15.7111206,0.87566392 C15.7111206,0.568425234 15.6583371,0.273514797 15.5613436,-0.000493882301 L19,0.000663920376 Z" id="形状结合" fill="#333333"></path>
                <path d="M13.0861206,0.000663920376 C13.5693698,0.000663920376 13.9611206,0.392414764 13.9611206,0.87566392 C13.9611206,1.35891308 13.5693698,1.75066392 13.0861206,1.75066392 L7.83612061,1.75066392 C7.35287145,1.75066392 6.96112061,1.35891308 6.96112061,0.87566392 C6.96112061,0.392414764 7.35287145,0.000663920376 7.83612061,0.000663920376 L13.0861206,0.000663920376 Z" id="合并形状" fill="#333333"></path>
                <path d="M5.875,4.00066392 L15.125,4.00066392 C15.6082492,4.00066392 16,4.39241476 16,4.87566392 C16,5.35891308 15.6082492,5.75066392 15.125,5.75066392 L5.875,5.75066392 C5.39175084,5.75066392 5,5.35891308 5,4.87566392 C5,4.39241476 5.39175084,4.00066392 5.875,4.00066392 Z" id="矩形" fill="#333333"></path>
                <path d="M5.875,8.50066392 L15.125,8.50066392 C15.6082492,8.50066392 16,8.89241476 16,9.37566392 C16,9.85891308 15.6082492,10.2506639 15.125,10.2506639 L5.875,10.2506639 C5.39175084,10.2506639 5,9.85891308 5,9.37566392 C5,8.89241476 5.39175084,8.50066392 5.875,8.50066392 Z" id="矩形-copy-30" fill="#333333"></path>
                <path d="M13.9000158,12.8637621 C14.2517669,12.5324 14.8055397,12.5489285 15.1369018,12.9006797 C15.4406504,13.2231182 15.4520742,13.715311 15.1809309,14.0503372 L15.0999842,14.1375657 L9.74067458,19.1862269 C9.41215115,19.4957077 8.90894268,19.500955 8.57474429,19.216807 L8.48804783,19.1321482 L5.8473575,16.1751159 C5.52547319,15.8146714 5.5567324,15.2615346 5.9171769,14.9396503 C6.24758435,14.6445897 6.73990686,14.6462677 7.067599,14.9262304 L7.1526425,15.0094697 L9.194,17.296 L13.9000158,12.8637621 Z" id="路径-5" fill="#39BF3E"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const fee_bills = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>费用账单</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="文件-账单">
            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="30" height="30"></rect>
            <g id="编组-19" transform="translate(3.000000, 3.000000)" fill-rule="nonzero">
                <path d="M23.1418994,17.8044643 C23.6165363,17.8044643 24,17.4214286 24,16.9473214 C24,16.4732143 23.6165363,16.0901786 23.1418994,16.0901786 L21.162905,16.0901786 L23.8283799,12.5410714 C24.1126257,12.1633929 24.0348603,11.625 23.6567598,11.3410714 C23.2786592,11.0571429 22.7396648,11.1348214 22.455419,11.5125 L19.4332961,15.5383929 L16.4084916,11.5125 C16.1242458,11.1348214 15.5852514,11.0571429 15.2071508,11.3410714 C14.8290503,11.625 14.7512849,12.1633929 15.0355307,12.5410714 L17.7010056,16.0901786 L15.7220112,16.0901786 C15.2473743,16.0901786 14.8639106,16.4732143 14.8639106,16.9473214 C14.8639106,17.4214286 15.2473743,17.8044643 15.7220112,17.8044643 L18.572514,17.8044643 L18.572514,19.4276786 L15.7220112,19.4276786 C15.2473743,19.4276786 14.8639106,19.8107143 14.8639106,20.2848214 C14.8639106,20.7589286 15.2473743,21.1419643 15.7220112,21.1419643 L18.572514,21.1419643 L18.572514,23.1428571 C18.572514,23.6169643 18.9559777,24 19.4306145,24 C19.9052514,24 20.2887151,23.6169643 20.2887151,23.1428571 L20.2887151,21.1446429 L23.1392179,21.1446429 C23.6138547,21.1446429 23.9973184,20.7616071 23.9973184,20.2875 C23.9973184,19.8133929 23.6138547,19.4303571 23.1392179,19.4303571 L20.2913966,19.4303571 L20.2913966,17.8071429 L23.1418994,17.8071429 L23.1418994,17.8044643 Z" id="路径" fill="#26B942"></path>
                <path d="M15.4699441,5.14285714 C15.4699441,4.66875 15.0864804,4.28571429 14.6145251,4.28571429 L4.33340782,4.28571429 C3.86145251,4.28571429 3.47798883,4.66875 3.47798883,5.14285714 C3.47798883,5.61696429 3.86145251,6 4.33340782,6 L14.6145251,6 C15.0864804,6 15.4699441,5.61696429 15.4699441,5.14285714 Z" id="路径" fill="#333333"></path>
                <path d="M13.7269274,10.2857143 C13.7269274,9.81160714 13.3434637,9.42857143 12.8715084,9.42857143 L4.33340782,9.42857143 C3.86145251,9.42857143 3.47798883,9.81160714 3.47798883,10.2857143 C3.47798883,10.7598214 3.86145251,11.1428571 4.33340782,11.1428571 L12.8715084,11.1428571 C13.3434637,11.1428571 13.7269274,10.7598214 13.7269274,10.2857143 Z" id="路径" fill="#333333"></path>
                <path d="M4.33340782,14.5714286 C3.86145251,14.5714286 3.47798883,14.9544643 3.47798883,15.4285714 C3.47798883,15.9026786 3.86145251,16.2857143 4.33340782,16.2857143 L9.47396648,16.2857143 C9.94592179,16.2857143 10.3293855,15.9026786 10.3293855,15.4285714 C10.3293855,14.9544643 9.94592179,14.5714286 9.47396648,14.5714286 L4.33340782,14.5714286 Z" id="路径" fill="#333333"></path>
                <path d="M12.8795531,20.5714286 L2.56625698,20.5714286 C2.09430168,20.5714286 1.71083799,20.1883929 1.71083799,19.7142857 L1.71083799,2.57142857 C1.71083799,2.09732143 2.09430168,1.71428571 2.56625698,1.71428571 L18.3387709,1.71428571 C18.8107263,1.71428571 19.1941899,2.09732143 19.1941899,2.57142857 L19.1941899,9.42857143 C19.1941899,9.90267857 19.5776536,10.2857143 20.0496089,10.2857143 C20.5215642,10.2857143 20.9050279,9.90267857 20.9050279,9.42857143 L20.9050279,1.71428571 C20.9050279,0.76875 20.1381006,0 19.1941899,0 L1.71083799,0 C0.766927374,0 0,0.76875 0,1.71428571 L0,20.5714286 C0,21.5169643 0.766927374,22.2857143 1.71083799,22.2857143 L12.8795531,22.2857143 C13.3515084,22.2857143 13.7349721,21.9026786 13.7349721,21.4285714 C13.7349721,20.9544643 13.3541899,20.5714286 12.8795531,20.5714286 Z" id="路径" fill="#333333"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const ext_store = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>外卖门店</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="外卖门店">
            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="30" height="30"></rect>
            <g id="编组-15" transform="translate(3.000000, 4.000000)" fill-rule="nonzero">
                <path d="M19.7826901,0 C20.8051876,0.0199951448 21.7080086,0.663798722 22.0487074,1.6159018 L24,8.29259495 L24,8.43465225 C23.9797809,9.86653973 22.6540051,11.3405134 21.7699513,11.7108488 C21.1805821,11.957739 20.5990909,12.0465248 20.0254777,11.9772062 C19.0713385,11.8944174 18.1859699,11.4525549 17.5526414,10.7430834 C16.8524179,11.5388392 15.8372099,11.9958093 14.7695766,11.9958093 C13.7019433,11.9958093 12.6867353,11.5388392 11.9865118,10.7430834 C11.2846176,11.5392169 10.2679692,11.9962626 9.19895092,11.9962626 C8.12993265,11.9962626 7.11328419,11.5392169 6.41139003,10.7430834 C5.77082403,11.4640032 4.80179843,11.9721695 3.90258524,11.9860848 C3.30310978,11.9953616 2.74260022,11.9065758 2.22105658,11.7197273 C0.887882469,11.1595716 0.01635007,9.87400713 0,8.44353083 L0,8.17717339 L1.91532409,1.66029471 C2.24087562,0.690694489 3.14713688,0.0266833081 4.18134133,0 L19.7826901,0 Z M19.7826901,1.74020194 L4.18134133,1.74020194 C3.92350055,1.77463461 3.70047998,1.93478321 3.58786062,2.16637384 L1.71749719,8.47016657 C1.79799505,9.44596397 2.6324336,10.1921389 3.62382915,10.1748542 C4.64671807,10.1998755 5.50011315,9.40868428 5.53915324,8.39913792 C5.63941533,8.00413925 5.99896692,7.72712247 6.41139003,7.72712247 C6.82381314,7.72712247 7.18336474,8.00413925 7.28362683,8.39913792 C7.28362683,9.4435845 8.14114663,10.2902757 9.19895092,10.2902757 C10.2567552,10.2902757 11.114275,9.4435845 11.114275,8.39913792 C11.2145371,8.00413925 11.5740887,7.72712247 11.9865118,7.72712247 C12.3989349,7.72712247 12.7584865,8.00413925 12.8587486,8.39913792 C12.9276997,9.390989 13.7626769,10.1607732 14.7695766,10.1607732 C15.7764764,10.1607732 16.6114535,9.390989 16.6804046,8.39913792 C16.685016,7.92245319 17.0700549,7.53443782 17.5526414,7.52015837 L17.5526414,7.50240121 C18.0322219,7.50180895 18.427876,7.87293385 18.4518546,8.34586643 C18.4956258,9.35327784 19.3461502,10.1418077 20.3671787,10.1215827 C21.3827456,10.1279193 22.225037,9.34702241 22.2825028,8.34586643 L20.4121394,2.15749526 C20.2865961,1.92286561 20.0501602,1.76612043 19.7826901,1.74020194 Z" id="形状结合" fill="#333333"></path>
                <path d="M16.0762621,5.35225655 L7.69817401,5.35225655 C7.30719656,5.35225655 7,5.05476011 7,4.67612828 C7,4.29749644 7.30719656,4 7.69817401,4 L16.0762621,4 C16.4672395,4 16.7744361,4.29749644 16.7744361,4.67612828 C16.7744361,5.05476011 16.4672395,5.35225655 16.0762621,5.35225655 Z" id="路径" stroke="#24B942" stroke-width="0.25" fill="#26B942"></path>
                <path d="M21.269021,11 C20.8074787,11 20.5405381,11.3955109 20.5405381,11.8834624 L20.5428815,19.8366737 C20.5428815,20.1111077 20.3313413,20.3341527 20.0723478,20.3350973 L3.93247955,20.3458933 C3.67348607,20.3458933 3.46311755,20.1242248 3.46311755,19.852139 L3.45685158,11.9804643 C3.45634215,11.4938893 3.18873933,11.099512 2.72836875,11.099512 C2.26631705,11.1007535 1.99935102,11.4962644 1.99999764,11.9851605 L2.00561699,19.7406165 C2.00561699,20.9859872 2.9654568,22 4.14519144,22 L19.8619793,21.989204 C21.0406696,21.9867479 21.9999976,20.970495 21.9999976,19.7239097 L21.9976566,11.8833274 C21.9975038,11.3945392 21.7305632,11 21.269021,11 Z" id="路径" stroke="#333333" stroke-width="0.25" fill="#333333"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const deliveries = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>配送管理</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="配送管理">
            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="30" height="30"></rect>
            <g id="编组-8" transform="translate(2.000000, 5.000000)" fill-rule="nonzero">
                <path d="M17.1750806,6.81683832 L21.5316864,6.81683832 L24.575725,14.2657624 L24.575725,16.0372185 L22.7325456,16.0372185 L22.7325456,17.389475 C22.7325456,18.6200285 21.6992481,19.6206983 20.4146079,19.6206983 C19.1439313,19.6206983 18.0966702,18.6200285 18.0966702,17.389475 L18.0966702,16.0372185 L7.86143931,16.0372185 L7.86143931,17.389475 C7.86143931,18.6200285 6.82814178,19.6206983 5.54350161,19.6206983 C4.25886144,19.6206983 3.22556391,18.6200285 3.22556391,17.389475 L3.22556391,16.0372185 L1.39634801,16.0372185 L1.39634801,1.35225655 L17.1750806,1.35225655 L17.1750806,6.81683832 Z M17.6498389,0 L0.921589689,0 C0.404940924,0 0,0.405676966 0,0.892489324 L0,16.4969857 C0,16.9973206 0.418904404,17.389475 0.921589689,17.389475 L1.84317938,17.389475 C1.84317938,19.3637696 3.50483351,20.9729549 5.55746509,20.9729549 C7.59613319,20.9729549 9.27175081,19.3637696 9.27175081,17.389475 L16.7142857,17.389475 C16.7142857,19.3637696 18.3759398,20.9729549 20.4285714,20.9729549 C22.4672395,20.9729549 24.1428571,19.3637696 24.1428571,17.389475 L25.0644468,17.389475 C25.5810956,17.389475 25.9860365,16.983798 25.9860365,16.4969857 L25.9860365,14.0223562 C26.0139635,13.9412208 26,13.8600854 25.9441461,13.7924726 L22.4253491,5.65389768 C22.3136412,5.51867203 22.1879699,5.46458176 22.0343716,5.46458176 L18.5714286,5.46458176 L18.5714286,0.892489324 C18.5714286,0.3921544 18.1664876,0 17.6498389,0 Z" id="形状" stroke="#333333" stroke-width="0.25" fill="#333333"></path>
                <path d="M20.4425349,21 C18.3759398,21 16.7003222,19.3772921 16.7003222,17.3759524 C16.7003222,15.3746127 18.3759398,13.7519049 20.4425349,13.7519049 C22.50913,13.7519049 24.1847476,15.3746127 24.1847476,17.3759524 C24.1847476,19.3772921 22.50913,21 20.4425349,21 Z M20.4425349,15.1041614 C19.1439313,15.1041614 18.0966702,16.1183538 18.0966702,17.3759524 C18.0966702,18.633551 19.1439313,19.6477434 20.4425349,19.6477434 C21.7411386,19.6477434 22.7883996,18.633551 22.7883996,17.3759524 C22.7883996,16.1183538 21.7411386,15.1041614 20.4425349,15.1041614 Z M5.55746509,21 C3.49087003,21 1.81525242,19.3772921 1.81525242,17.3759524 C1.81525242,15.3746127 3.49087003,13.7519049 5.55746509,13.7519049 C7.62406015,13.7519049 9.29967777,15.3746127 9.29967777,17.3759524 C9.29967777,19.3772921 7.62406015,21 5.55746509,21 Z M5.55746509,15.1041614 C4.25886144,15.1041614 3.21160043,16.1183538 3.21160043,17.3759524 C3.21160043,18.633551 4.25886144,19.6477434 5.55746509,19.6477434 C6.85606874,19.6477434 7.90332975,18.633551 7.90332975,17.3759524 C7.90332975,16.1183538 6.85606874,15.1041614 5.55746509,15.1041614 Z" id="形状" fill="#333333"></path>
                <path d="M17.1750806,15.3610902 L17.1750806,6.78845349 C17.1750806,6.40982165 17.4822771,6.11232521 17.8732546,6.11232521 C18.264232,6.11232521 18.5714286,6.40982165 18.5714286,6.78845349 L18.5714286,15.3610902 C18.5714286,15.739722 18.264232,16.0372185 17.8732546,16.0372185 C17.4822771,16.0372185 17.1750806,15.739722 17.1750806,15.3610902 Z" id="形状" stroke="#333333" stroke-width="0.25" fill="#333333"></path>
                <path d="M13.6842105,8.16695973 L5.30612245,8.16695973 C4.91514501,8.16695973 4.60794844,7.86946328 4.60794844,7.49083145 C4.60794844,7.11219961 4.91514501,6.81470317 5.30612245,6.81470317 L13.6842105,6.81470317 C14.075188,6.81470317 14.3823845,7.11219961 14.3823845,7.49083145 C14.3823845,7.86946328 14.075188,8.16695973 13.6842105,8.16695973 Z" id="路径" stroke="#24B942" stroke-width="0.25" fill="#26B942"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const stores = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>门店管理</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="门店管理">
            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="30" height="30"></rect>
            <g id="编组-16" transform="translate(3.000000, 3.000000)" fill-rule="nonzero">
                <path d="M23.6852787,8.70738222 L23.6852787,8.55172975 L21.751967,1.76711332 C21.4545893,0.913707965 20.671709,0.334955513 19.7826901,0.311304937 L4.18134133,0.311304937 C3.28118256,0.335203745 2.49291626,0.93259777 2.21206444,1.80373743 L0.305732484,8.55172975 L0.305732484,8.73485031 C0.315400117,10.1601449 1.20479512,11.4250596 2.52678906,11.8936798 L2.52678906,19.5114948 C2.55634942,21.267719 3.97615272,22.6683509 5.70101161,22.6428562 L13.49719,22.6428562 C13.7996764,22.6381208 14.045134,22.3922205 14.0547021,22.0843385 C14.045134,21.7764565 13.7996764,21.5305562 13.49719,21.5258208 L5.70101161,21.5258208 C4.58757878,21.5259969 3.67941763,20.6175776 3.65979768,19.4840267 L3.65979768,12.0584883 C4.77408323,12.060534 5.81741658,11.5019437 6.44735856,10.5660558 C7.07793101,11.5014768 8.12065362,12.0604882 9.23491945,12.0604882 C10.3491853,12.0604882 11.3919079,11.5014768 12.0224803,10.5660558 C12.6510035,11.5015023 13.692417,12.0608489 14.8055451,12.0608489 C15.9186733,12.0608489 16.9600868,11.5015023 17.58861,10.5660558 C18.2185519,11.5019437 19.2618853,12.060534 20.3761709,12.0584883 L20.3761709,12.8001265 C20.3761709,13.1136441 20.6257776,13.3678003 20.933683,13.3678003 C21.2415885,13.3678003 21.4911952,13.1136441 21.4911952,12.8001265 L21.4911952,11.8845238 C22.8087509,11.4043968 23.6872544,10.1322782 23.6852787,8.70738222 Z M18.1101536,8.62497797 C18.1101536,8.31146044 17.8605469,8.05730426 17.5526414,8.05730426 C17.244736,8.05730426 16.9951293,8.31146044 16.9951293,8.62497797 C16.9204484,9.82067698 15.9462446,10.7515562 14.7695766,10.7515562 C13.5929087,10.7515562 12.6187048,9.82067698 12.544024,8.62497797 C12.544024,8.31146044 12.2944173,8.05730426 11.9865118,8.05730426 C11.6786063,8.05730426 11.4289996,8.31146044 11.4289996,8.62497797 C11.4289996,9.88916157 10.422521,10.9139849 9.18096665,10.9139849 C7.93941233,10.9139849 6.93293368,9.88916157 6.93293368,8.62497797 C6.93293368,8.31146044 6.68332698,8.05730426 6.37542151,8.05730426 C6.06751603,8.05730426 5.81790933,8.31146044 5.81790933,8.62497797 C5.79331067,9.85529226 4.79623574,10.8336968 3.58786062,10.8132686 C2.41003702,10.8252474 1.42957526,9.89534926 1.35781191,8.69822619 L3.29112027,2.14251045 C3.44372325,1.76683032 3.79202649,1.51148115 4.19033346,1.48327647 L19.7826901,1.48327647 C20.1760351,1.52509557 20.5181939,1.77594008 20.6819033,2.14251045 L22.5342825,8.67075811 C22.4770507,9.86456243 21.5140049,10.8049728 20.3402023,10.8132686 C19.1318272,10.8336968 18.1347523,9.85529226 18.1101536,8.62497797 Z" id="形状" fill="#333333"></path>
                <path d="M13.5061821,22.9633172 L5.70101161,22.9633172 C3.79943896,22.9735386 2.24572617,21.4201225 2.22105658,19.4840267 L2.22105658,12.0859564 C0.887882469,11.5082964 0.01635007,10.1825594 0,8.70738222 L0,8.4327014 L1.91532409,1.71217716 C2.24087562,0.71227796 3.14713688,0.0275171332 4.18134133,0 L19.7826901,0 C20.8051876,0.0206199719 21.7080086,0.684541729 22.0487074,1.66639702 L24,8.55172975 L24,8.69822619 C23.9797809,10.1748586 23.1050989,11.5000216 21.7699513,12.0768004 L21.7699513,12.7909705 C21.6696892,13.1983125 21.3101376,13.4839857 20.8977145,13.4839857 C20.4852914,13.4839857 20.1257398,13.1983125 20.0254777,12.7909705 L20.0254777,12.3514812 C19.0713385,12.2661053 18.1859699,11.8104351 17.5526414,11.0787934 C16.8524179,11.8994157 15.8372099,12.3706656 14.7695766,12.3706656 C13.7019433,12.3706656 12.6867353,11.8994157 11.9865118,11.0787934 C11.2846176,11.8998052 10.2679692,12.3711331 9.19895092,12.3711331 C8.12993265,12.3711331 7.11328419,11.8998052 6.41139003,11.0787934 C5.77082403,11.8222411 4.87081962,12.2820876 3.90258524,12.3606372 L3.90258524,19.4840267 C3.91428756,19.9560218 4.11100504,20.4036202 4.44886531,20.7269974 C4.78672558,21.0503746 5.23762809,21.2226347 5.70101161,21.2053599 L13.5421506,21.2053599 C13.9097014,21.0962036 14.3048255,21.2359923 14.5267215,21.5536857 C14.7486175,21.871379 14.7486175,22.297298 14.5267215,22.6149913 C14.3048255,22.9326847 13.9097014,23.0724734 13.5421506,22.9633172 L13.5061821,22.9633172 Z M0.638441364,8.55172975 L0.638441364,8.68907017 C0.643153457,9.98113764 1.4518589,11.1280794 2.65267891,11.5457508 L2.85949794,11.628155 L2.85949794,19.4657146 C2.88899827,21.0391855 4.15545795,22.2960817 5.70101161,22.2858341 L13.49719,22.2858341 C13.6263116,22.2858341 13.7309854,22.1791895 13.7309854,22.0477144 C13.7309854,21.9162393 13.6263116,21.8096577 13.49719,21.8096577 L5.70101161,21.8096577 C4.41575434,21.804918 3.36949934,20.7558579 3.34507306,19.4474026 L3.34507306,11.7380273 L3.65979768,11.7380273 C4.65594069,11.7211169 5.58310791,11.216706 6.15061821,10.3829353 L6.41139003,9.98922608 L6.67216186,10.3829353 C7.24678273,11.2263151 8.19086264,11.7293879 9.19895092,11.7293879 C10.2070392,11.7293879 11.1511191,11.2263151 11.72574,10.3829353 L11.9865118,9.98922608 L12.2472836,10.3829353 C12.8198765,11.2263186 13.7626401,11.7297033 14.7695766,11.7297033 C15.7765131,11.7297033 16.7192767,11.2263186 17.2918696,10.3829353 L17.5526414,9.98922608 L17.8134133,10.3829353 C18.3922835,11.2213315 19.3337114,11.7227986 20.3402023,11.7288713 L20.6549269,11.7288713 L20.6549269,12.7909705 C20.6678514,12.9200713 20.7705273,13.0207466 20.8977145,13.0290272 C21.0265646,13.0246691 21.1313645,12.9219113 21.1405021,12.7909705 L21.1405021,11.6464671 L21.3473211,11.5640628 C22.5516914,11.1495277 23.3645228,10.0018578 23.3705508,8.70738222 L23.3705508,8.634134 L21.4552267,1.84951757 C21.2000536,1.13072521 20.5332786,0.648905276 19.7826901,0.64092193 L4.18134133,0.64092193 C3.42239173,0.659620032 2.75671389,1.16156645 2.51779693,1.89529771 L0.638441364,8.55172975 Z M20.3402023,11.1154175 C18.9580254,11.1358203 17.8200566,10.0139596 17.795429,8.60666592 C17.7820097,8.47932883 17.6783604,8.38160808 17.5526414,8.37776523 C17.428447,8.38532238 17.3267931,8.48116192 17.3098539,8.60666592 C17.2298355,9.97550215 16.1162896,11.0438615 14.7695766,11.0438615 C13.4228636,11.0438615 12.3093178,9.97550215 12.2292994,8.60666592 C12.2123601,8.48116192 12.1107062,8.38532238 11.9865118,8.37776523 C11.8607928,8.38160808 11.7571436,8.47932883 11.7437242,8.60666592 C11.7437242,10.0377218 10.6043904,11.1978217 9.19895092,11.1978217 C7.79351142,11.1978217 6.65417759,10.0377218 6.65417759,8.60666592 C6.65417759,8.47013409 6.5454779,8.35945317 6.41139003,8.35945317 C6.27730217,8.35945317 6.16860247,8.47013409 6.16860247,8.60666592 C6.18305908,9.53239673 5.71138648,10.3956603 4.93125918,10.8712737 C4.15113187,11.3468871 3.18106976,11.3625933 2.38648585,10.9124759 C1.59190194,10.4623584 1.09351243,9.61480097 1.07905583,8.68907017 L1.07905583,8.64329003 L3.00337205,2.04179415 C3.19183584,1.52468595 3.65911265,1.16694635 4.19932559,1.12619139 L19.7826901,1.12619139 C20.3314927,1.16642595 20.8096992,1.52184389 21.0146122,2.04179415 L22.8849756,8.634134 L22.8849756,8.67991414 C22.8176602,10.0591689 21.6964241,11.1403286 20.3402023,11.1337295 L20.3402023,11.1154175 Z M17.5526414,7.7368433 C18.0322219,7.73623253 18.427876,8.11895469 18.4518546,8.60666592 C18.4956258,9.64555786 19.3461502,10.4587284 20.3671787,10.4378714 C21.3827456,10.444406 22.225037,9.63910695 22.2825028,8.60666592 L20.4121394,2.2249147 C20.2865961,1.98295312 20.0501602,1.82130982 19.7826901,1.7945814 L4.18134133,1.7945814 C3.92350055,1.83009007 3.70047998,1.99524314 3.58786062,2.23407073 L1.71749719,8.73485031 C1.79799505,9.74114034 2.6324336,10.5106324 3.62382915,10.4928076 C4.64671807,10.5186108 5.50011315,9.7026957 5.53915324,8.66160208 C5.63941533,8.25426012 5.99896692,7.96858686 6.41139003,7.96858686 C6.82381314,7.96858686 7.18336474,8.25426012 7.28362683,8.66160208 C7.28362683,9.73868651 8.14114663,10.611836 9.19895092,10.611836 C10.2567552,10.611836 11.114275,9.73868651 11.114275,8.66160208 C11.2145371,8.25426012 11.5740887,7.96858686 11.9865118,7.96858686 C12.3989349,7.96858686 12.7584865,8.25426012 12.8587486,8.66160208 C12.9276997,9.68444746 13.7626769,10.4782866 14.7695766,10.4782866 C15.7764764,10.4782866 16.6114535,9.68444746 16.6804046,8.66160208 C16.685016,8.17002146 17.0700549,7.76988102 17.5526414,7.75515535 L17.5526414,7.7368433 Z" id="形状" fill="#333333"></path>
                <path d="M20.5996415,15.0347038 C20.8995258,15.0810347 21.1521348,15.2815236 21.2468276,15.574535 C21.3257145,15.8367984 21.5151001,16.0681745 21.7677091,16.2068889 C22.0203182,16.3457424 22.304539,16.3919341 22.5886173,16.3302987 C22.8885016,16.2686634 23.2041917,16.3766296 23.3777714,16.6080057 C23.5987687,16.9319044 23.8039601,17.255664 23.9460705,17.61045 C24.0567116,17.8880178 23.9936305,18.2117774 23.7884391,18.4277099 C23.3937196,18.8441312 23.3937196,19.5073723 23.7884391,19.9392373 C23.9934881,20.1551697 24.0567116,20.4790685 23.9462129,20.7566363 C23.8041025,21.1114223 23.5989111,21.4507646 23.3621079,21.7437761 C23.1727223,21.9751522 22.8570322,22.0831185 22.5729539,22.0214831 C22.2887331,21.9597086 22.0046547,22.0060395 21.7520457,22.1447538 C21.499579,22.2836073 21.3258569,22.5148443 21.2311641,22.7771076 C21.1364713,23.0702582 20.8838623,23.2707471 20.5839781,23.3169388 C20.3945925,23.3323825 20.189401,23.3478261 19.999873,23.3478261 C19.8104875,23.3478261 19.6054384,23.3325216 19.4159104,23.3014952 C19.1160262,23.2553035 18.8634171,23.0548146 18.7687244,22.761664 C18.5950022,22.2065283 18.0110396,21.8826296 17.4269346,22.0060395 C17.1312197,22.0678945 16.8252227,21.9602127 16.6377806,21.7283325 C16.4011198,21.4198774 16.1959283,21.0959787 16.053818,20.7413318 C15.9433193,20.4636248 16.0064004,20.1397261 16.2115918,19.9237936 C16.6063112,19.5073723 16.6063112,18.8441312 16.2115918,18.4124054 C16.0065427,18.1964729 15.9433193,17.8725742 16.053818,17.5948672 C16.1959283,17.2400813 16.4011198,16.900878 16.6377806,16.6078666 C16.8271662,16.3764905 17.1429986,16.2683851 17.4428829,16.3301596 C17.7269613,16.3919341 18.0110396,16.3456032 18.2636487,16.2067497 C18.5162577,16.0680354 18.6899798,15.8366593 18.7846726,15.5743959 C18.8790806,15.2813844 19.1316897,15.0808956 19.4315739,15.0347038 C19.8194898,14.9884321 20.2117257,14.9884321 20.5996415,15.0347038 Z M20.173913,17.7826087 C19.4055169,17.7826087 18.7826087,18.4055169 18.7826087,19.173913 C18.7826087,19.9423092 19.4055169,20.5652174 20.173913,20.5652174 C20.9423092,20.5652174 21.5652174,19.9423092 21.5652174,19.173913 C21.5652174,18.4055169 20.9423092,17.7826087 20.173913,17.7826087 Z" id="形状结合" fill="#26B942"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const printer = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>打印</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="打印">
            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="30" height="30"></rect>
            <g id="编组-6" transform="translate(3.000000, 3.000000)" fill-rule="nonzero">
                <path d="M22.3999927,4.79999999 L19.2000055,4.79999999 L19.2000055,1.60000915 C19.2000055,0.716320353 18.483686,0 17.5999982,0 L6.40000182,0 C5.51631403,0 4.7999945,0.716320353 4.7999945,1.60000915 L4.7999945,4.79999999 L1.60000732,4.79999999 C0.716319534,4.79999999 0,5.51632034 0,6.40000914 L0,14.4 C0,15.2836888 0.716319534,16 1.60000732,16 L4,16 L4,22.3999909 C4,23.2835973 4.71632409,24 5.60001187,24 L18.3999881,24 C19.2836759,24 20,23.2835973 20,22.3999909 L20,16 L22.3999927,16 C23.2836805,16 24,15.2836888 24,14.4 L24,6.40000916 C24,5.51632037 23.2836805,4.79999999 22.3999927,4.79999999 Z M6.40000182,2.40000001 C6.40000182,1.95816934 6.7581616,1.60000917 7.19999173,1.60000917 L16.7999808,1.60000917 C17.2417285,1.60000917 17.5999707,1.95816936 17.5999707,2.40000001 L17.5999707,4.80000002 L6.40000182,4.80000002 L6.40000182,2.40000001 Z M18.3999881,21.6 C18.3999881,22.0418307 18.0417459,22.3999909 17.5999982,22.3999909 L6.40000182,22.3999909 C5.95817165,22.3999909 5.6000119,22.0418307 5.6000119,21.6 L5.6000119,13.6000092 C5.6000119,13.1581785 5.95817168,12.8000183 6.40000182,12.8000183 L17.5999982,12.8000183 C18.0417459,12.8000183 18.3999881,13.1581785 18.3999881,13.6000091 L18.3999881,21.6 Z M22.3999927,13.6000092 C22.3999927,14.0418398 22.0417505,14.4000092 21.6000073,14.4000092 L19.9999954,14.4000092 L19.9999954,12.7999908 C19.9999954,11.9163021 19.2836759,11.1999817 18.3999881,11.1999817 L5.60000732,11.1999817 C4.71632411,11.1999817 4.00000458,11.9163021 4.00000458,12.7999908 L4.00000458,14.4000092 L2.39999726,14.4000092 C1.9581671,14.4000092 1.60000732,14.0418398 1.60000732,13.6000092 L1.60000732,7.2 C1.60000732,6.75816933 1.9581671,6.40000916 2.39999724,6.40000916 L21.5999753,6.40000916 C22.0417231,6.40000916 22.3999927,6.75816935 22.3999927,7.2 L22.3999927,13.6000092 L22.3999927,13.6000092 Z" id="形状" fill="#333333"></path>
                <path d="M15.9999908,15.1999909 L8.00000913,15.1999909 C7.55817897,15.1999909 7.20001921,15.558151 7.20001921,15.9999817 C7.20001921,16.4418123 7.55817899,16.8 8.00000913,16.8 L15.9999908,16.8 C16.4417386,16.8 16.7999808,16.4418398 16.7999808,16.0000092 C16.7999808,15.5581785 16.4417661,15.1999909 15.9999908,15.1999909 Z" id="路径" fill="#26B942"></path>
                <path d="M15.9999908,18.4000091 L8.00000913,18.4000091 C7.55817897,18.4000091 7.20001921,18.7581693 7.20001921,19.2 C7.20001921,19.6418306 7.55817899,19.9999908 8.00000913,19.9999908 L15.9999908,19.9999908 C16.4417386,19.9999908 16.7999808,19.6418307 16.7999808,19.2 C16.7999808,18.7581694 16.4417661,18.4000091 15.9999908,18.4000091 Z" id="路径" fill="#26B942"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const push = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>通知设置</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="通知设置s">
            <rect id="矩形" opacity="0.300000012" fill-rule="nonzero" x="0" y="0" width="30" height="30"></rect>
            <g id="分组-35" transform="translate(3.500000, 5.000000)">
                <path d="M2,0 L22,0 C23.1045695,-2.02906125e-16 24,0.8954305 24,2 L24,15.5785124 C24,16.6830819 23.1045695,17.5785124 22,17.5785124 L12.1289726,17.5785124 L12.1289726,17.5785124 C11.3688478,17.5785124 10.6293013,17.8254857 10.0217099,18.2822376 L5.84632566,21.4210492 C5.73596106,21.5040149 5.57923588,21.4818037 5.49627018,21.3714391 C5.46459011,21.3292969 5.4470439,21.2782179 5.44613974,21.2255038 L5.40044352,18.5613626 C5.3910866,18.015844 4.94618942,17.5785124 4.40059058,17.5785124 L3.75433079,17.5785124 L3.75433079,17.5785124 L2,17.5785124 C0.8954305,17.5785124 4.57616285e-15,16.6830819 0,15.5785124 L0,2 C-1.3527075e-16,0.8954305 0.8954305,2.02906125e-16 2,0 Z" id="矩形" stroke="#333333" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M5.5,11 C6.46649831,11 7.25,10.2164983 7.25,9.25 C7.25,8.28350169 6.46649831,7.5 5.5,7.5 C4.53350169,7.5 3.75,8.28350169 3.75,9.25 C3.75,10.2164983 4.53350169,11 5.5,11 Z M12,11 C12.9664983,11 13.75,10.2164983 13.75,9.25 C13.75,8.28350169 12.9664983,7.5 12,7.5 C11.0335017,7.5 10.25,8.28350169 10.25,9.25 C10.25,10.2164983 11.0335017,11 12,11 Z M18.5,11 C19.4664983,11 20.25,10.2164983 20.25,9.25 C20.25,8.28350169 19.4664983,7.5 18.5,7.5 C17.5335017,7.5 16.75,8.28350169 16.75,9.25 C16.75,10.2164983 17.5335017,11 18.5,11 Z" id="合并形状" fill="#26B942"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const setting = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>编组 21备份</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="编组-21备份" fill-rule="nonzero">
            <g id="设置">
                <rect id="矩形" opacity="0.300000012" x="0" y="0" width="30" height="30"></rect>
                <path d="M13.4864669,3.96659119 C14.5220565,3.84441962 15.5689329,3.84446825 16.60439,3.96674338 C16.8747745,4.01095914 17.1243931,4.12266534 17.3268706,4.29155599 C17.5194752,4.45221144 17.6684222,4.66486223 17.7506734,4.9169004 C18.0433415,5.87688742 18.733964,6.72771726 19.6606748,7.23659882 C20.5739198,7.73858902 21.6015347,7.9023791 22.6184318,7.68169326 C22.893091,7.6252424 23.1751134,7.6462655 23.4279139,7.7352272 C23.6534273,7.81458642 23.8570515,7.94847611 24.0020054,8.13626162 C24.5956285,9.00711827 25.150452,9.87611906 25.5321464,10.8290357 C25.6283242,11.0703192 25.6477147,11.3316544 25.59993,11.5793997 C25.5520046,11.8278753 25.4363601,12.0636693 25.2567175,12.2527166 C24.5309017,13.0184382 24.1656486,14.0105011 24.1656486,15.0108364 C24.1656486,16.0030317 24.5254991,17.0024398 25.2458914,17.7906255 C25.4361689,17.9912332 25.5518664,18.2272928 25.5998761,18.4760229 C25.6477188,18.7238877 25.6284919,18.9853498 25.5330999,19.2249758 C25.1567775,20.1644843 24.612535,21.0625203 23.9889593,21.8341367 C23.8202559,22.040245 23.5944556,22.1896984 23.3489887,22.2760794 C23.1033169,22.3625324 22.836201,22.3866448 22.583082,22.3317267 C21.5563277,22.1085648 20.5292177,22.2727052 19.6154598,22.7744742 C18.7005369,23.2776704 18.0607395,24.1088925 17.7165988,25.0620328 C17.6249801,25.3440159 17.4754874,25.5581899 17.2818303,25.7197232 C17.0828166,25.8857246 16.8382383,25.9963929 16.5730994,26.041921 C16.0613837,26.0835153 15.5099134,26.125 14.999635,26.125 C14.5010103,26.125 13.9611156,26.084983 13.4539494,26.0019976 C13.1783263,25.9595429 12.9237106,25.8470361 12.7178491,25.6753228 C12.524192,25.5137894 12.3746993,25.2996155 12.2951487,25.0534615 C11.9776475,24.0388741 11.2881589,23.233034 10.4087116,22.7377761 C9.53772871,22.2472849 8.47998519,22.0626383 7.42328928,22.2858992 C7.15776537,22.3414391 6.88760728,22.3209755 6.64175323,22.2344584 C6.40131892,22.1498484 6.18392682,22.0019164 6.01836124,21.7989723 C5.39124216,20.9801687 4.84413733,20.1221768 4.46773207,19.1828369 C4.37158303,18.9411936 4.35223636,18.6794773 4.40011248,18.4313973 C4.44808563,18.1828143 4.56370958,17.9469234 4.74337131,17.7578561 C5.46919073,16.9921307 5.83444019,16.0000613 5.83444019,14.9997863 C5.83444019,14.0075796 5.47454624,13.0082314 4.75410264,12.2202436 C4.56391707,12.0197365 4.44822222,11.7836711 4.4002141,11.534907 C4.35235479,11.2869139 4.37161673,11.025294 4.46698889,10.7855969 C4.84333788,9.84602213 5.38764044,8.94830512 6.01072008,8.17683595 C6.17965496,7.97044488 6.40613182,7.82111548 6.65561812,7.73505923 C6.91310488,7.64624335 7.19606362,7.62442493 7.46235968,7.6792267 C8.48877476,7.90242665 9.51606668,7.73828093 10.4291545,7.23637706 C11.3447237,6.73361361 11.98473,5.9018496 12.3289319,4.94853988 C12.420411,4.66634588 12.5696417,4.45250093 12.7630074,4.2911812 C12.9656169,4.12214964 13.215563,4.01049979 13.4864669,3.96659119 Z" id="路径" stroke="#333333" stroke-width="1.75"></path>
                <path d="M14.999986,11.375 C15.9969062,11.375 16.9026155,11.7837063 17.5594544,12.4405115 C18.2162748,13.0972983 18.625,14.002934 18.6250054,15.0028575 C18.6283836,15.9644827 18.2478891,16.8877079 17.5679134,17.5677144 C16.8879231,18.2477355 15.9646691,18.6282976 14.999986,18.625 C14.0031045,18.625 13.0974431,18.2162173 12.4406259,17.5593665 C11.7837595,16.9024665 11.375,15.9966938 11.375,14.9997837 C11.375,14.0029318 11.7837201,13.0972935 12.4405373,12.4405057 C13.0973689,11.7837037 14.0030695,11.375 14.999986,11.375 Z" id="路径" stroke="#26B942" stroke-width="1.75"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const help = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>编组 23备份</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="帮助">
            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="30" height="30"></rect>
            <g id="编组-17" transform="translate(2.750000, 2.750000)" fill-rule="nonzero">
                <path d="M12.25,0 C18.9880712,0 24.5,5.51192881 24.5,12.25 C24.5,18.9880712 18.9880712,24.5 12.25,24.5 C5.51192881,24.5 0,18.9880712 0,12.25 C0,5.51192881 5.51192881,0 12.25,0 Z M12.25,2 C6.53807119,2 2,6.53807119 2,12.25 C2,17.9619288 6.53807119,22.5 12.25,22.5 C17.9619288,22.5 22.5,17.9619288 22.5,12.25 C22.5,6.53807119 17.9619288,2 12.25,2 Z" id="形状" fill="#333333"></path>
                <path d="M14.95,7.6 C15.55,8.2 15.85,8.95 15.85,10 C15.85,10.75 15.7,11.5 15.25,11.95 C15.25,12.1 14.8,12.55 13.9,13.3 C13.6,13.6 13.45,13.75 13.3,14.05 C13.15,14.35 13,14.8 13,15.25 L13,15.55 L11.2,15.55 L11.2,15.25 C11.2,14.65 11.35,14.05 11.5,13.75 C11.8,13.3 12.4,12.55 13.45,11.65 L13.75,11.2 C14.05,10.75 14.2,10.45 14.2,10 C14.2,9.4 14.05,8.95 13.75,8.65 C13.45,8.35 12.85,8.2 12.25,8.2 C11.65,8.2 11.05,8.5 10.75,8.95 C10.45,9.25 10.3,9.85 10.3,10.6 L8.5,10.6 C8.5,9.4 8.8,8.5 9.55,7.75 C10.3,7 11.2,6.7 12.4,6.7 C13.45,6.7 14.35,7 14.95,7.6 Z M13,16.75 C13.3,16.9 13.3,17.2 13.3,17.65 C13.3,17.95 13.15,18.25 13,18.55 C12.7,18.7 12.4,18.85 12.1,18.85 C11.8,18.85 11.5,18.7 11.2,18.55 C10.9,18.25 10.9,18.1 10.9,17.65 C10.9,17.35 11.05,17.05 11.2,16.75 C11.35,16.6 11.65,16.45 12.1,16.45 C12.55,16.3 12.85,16.45 13,16.75 Z" id="形状" fill="#26B942"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


export const history_notice = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>编组 27备份</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="编组-27备份" fill-rule="nonzero">
            <g id="公告">
                <rect id="矩形" opacity="0.300000012" x="0" y="0" width="30" height="30"></rect>
                <g id="分组-53" transform="translate(5.500000, 3.500000)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75">
                    <path d="M9.5,0.5 L9.5,6.86972415 C9.5,7.14586652 9.27614237,7.36972768 9,7.36972768 C8.87561698,7.36972768 8.75569959,7.32336326 8.6636636,7.23969418 L6.75,5.5 L4.8363364,7.23969418 C4.63200759,7.42544765 4.31578343,7.41038935 4.13002996,7.20606054 C4.04636089,7.11402456 4,6.99410717 4,6.86972415 L4,0.5" id="路径" stroke="#26B942"></path>
                    <path d="M2,0 L17,0 C18.1045695,-2.02906125e-16 19,0.8954305 19,2 L19,21 C19,22.1045695 18.1045695,23 17,23 L2,23 C0.8954305,23 1.3527075e-16,22.1045695 0,21 L0,2 C-1.3527075e-16,0.8954305 0.8954305,2.02906125e-16 2,0 Z" id="矩形" stroke="#333333"></path>
                    <line x1="4.5" y1="13.25" x2="14.5" y2="13.25" id="路径-15" stroke="#333333"></line>
                    <line x1="4.5" y1="17.75" x2="14.5" y2="17.75" id="路径-15-copy" stroke="#333333"></line>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const product = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>商品管理@1x</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="商品管理">
            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="30" height="30"></rect>
            <g id="编组-13" transform="translate(4.000000, 3.000000)" fill-rule="nonzero">
                <path d="M16.1534091,8.035198 C15.6230902,8.035198 15.1931818,8.4651064 15.1931818,8.99542528 L15.1931818,11.2381595 C15.1931818,12.2343141 14.8153201,13.1859292 14.1364162,13.8807682 C13.0859401,14.9578504 11.4923533,15.2888346 10.1038249,14.7184931 C8.71505114,14.1480509 7.80718017,12.7892303 7.80681816,11.280129 L7.80681816,8.99542526 C7.80681816,8.46510639 7.37690977,8.035198 6.8465909,8.035198 C6.31627203,8.035198 5.88636364,8.46510639 5.88636364,8.99542526 L5.88636364,11.280159 C5.88636364,14.3976097 8.39951464,16.92509 11.5,16.92509 C14.6004853,16.92509 17.1136363,14.3976097 17.1136363,11.280159 L17.1136363,8.99542528 C17.1136363,8.4651064 16.6837279,8.035198 16.1534091,8.035198 Z" id="路径" fill="#24B942"></path>
                <path d="M19.2086647,-0.125 C19.485281,-0.125 19.7494389,-0.0183422432 19.948377,0.169835491 L20.0421668,0.270601311 L22.8792871,3.7352974 C23.011698,3.89713234 23.094058,4.09331396 23.1178333,4.29974727 L23.125,4.4246447 L23.125,22 C23.125,23.1225788 22.2545366,24.04185 21.1517588,24.1196645 L21,24.125 L2,24.125 C0.877421215,24.125 -0.0418499511,23.2545366 -0.119664497,22.1517588 L-0.125,22 L-0.125,4.4246447 C-0.125,4.21508846 -0.0645985832,4.01092529 0.0475846006,3.83630027 L0.121039366,3.73526299 L2.95782453,0.2706119 C3.13356448,0.0559500384 3.38331149,-0.0813737013 3.65430952,-0.116228201 L3.79133522,-0.125 L19.2086647,-0.125 Z M21.204,5.885 L1.795,5.885 L1.795,22.195 L21.204,22.195 L21.204,5.885 Z M18.812,1.805 L4.188,1.805 L2.427,3.955 L20.572,3.955 L18.812,1.805 Z" id="形状" fill="#333333"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}
export const third_recharge = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>充值@1x</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="充值">
            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="30" height="30"></rect>
            <g id="编组-14" transform="translate(2.875000, 2.875000)" fill-rule="nonzero">
                <path d="M14.5868816,6.5953381 L12.049,9.115 L9.51312084,6.59533464 C9.16435751,6.24876504 8.63563276,6.24876504 8.28689336,6.5953381 C7.93772187,6.94234058 7.93772187,7.46914559 8.28689336,7.81614807 L11.2868939,10.7970776 L11.263,11.03 L8.67496502,11.0310361 C8.15613018,11.0310361 7.8,11.3849699 7.8,11.9013947 L7.80623415,12.017592 C7.85575516,12.4701467 8.19606304,12.7717065 8.67501769,12.7717065 L11.25,12.771 L11.25,13.713 L8.67495393,13.7142757 C8.15612238,13.7142757 7.8,14.0681938 7.8,14.5846343 L7.80623415,14.7008316 C7.85575516,15.1533863 8.19606304,15.4549461 8.67501769,15.4549461 L11.25,15.454 L11.2500059,16.9697027 C11.2500059,17.4861194 11.6061519,17.8400609 12.125,17.8400609 L12.2233837,17.8318216 C12.5486435,17.7773511 12.8432556,17.4574019 12.9935052,17.0094529 L12.998,15.454 L15.4249618,15.4549461 C15.9438677,15.4549461 16.3,15.1010202 16.3,14.5846109 L16.2937718,14.4684094 C16.2442513,14.0158389 15.9039465,13.7142757 15.4249882,13.7142757 L12.999,13.713 L12.999,12.771 L15.4249736,12.7717065 C15.9438715,12.7717065 16.3,12.4178003 16.3,11.9013947 L16.2937719,11.785189 C16.2442519,11.3326027 15.9039502,11.0310361 15.4249882,11.0310361 L12.999,11.03 L12.999,10.5604079 L15.8131068,7.81615377 C16.1622834,7.46911889 16.1622834,6.94234 15.8131125,6.5953381 C15.4643457,6.24876504 14.935621,6.24876504 14.5868816,6.5953381 Z" id="形状结合" fill="#333333"></path>
                <path d="M12.125,0 C5.45616175,0 0,5.42226858 0,12.0504571 C0,18.6786456 5.45616175,24.1009142 12.125,24.1009142 L14.3750059,24.1009142 C14.9725975,23.9096441 15.2578391,23.5316721 15.0935176,23.0417444 C14.9073452,22.4867837 14.527477,22.2036561 14.0356831,22.3665861 C13.8293915,22.417536 13.5871352,22.4534071 13.3087101,22.4761947 L12.9770396,22.4966838 L12.7430609,22.5045205 L12.3110213,22.5090843 C12.2533644,22.5092408 12.1916405,22.5093061 12.125,22.5093061 C6.34386058,22.5093061 1.75001179,17.9439797 1.75001179,12.1995195 C1.75001179,6.42573328 6.37280826,1.74067042 12.125,1.74067042 C17.9061359,1.74067042 22.4999885,6.30599349 22.5000118,12.0504576 L22.4942165,12.6223576 L22.4815841,12.8613743 C22.4619664,13.1343292 22.4227084,13.3857645 22.3537943,13.6597192 C22.1799682,14.1767328 22.5374439,14.7096109 23.0749941,14.7096109 C23.5642486,14.8783534 24.1000059,14.5234006 24.1000059,13.988338 C24.1872251,13.5636542 24.2258346,13.2260115 24.2411505,12.7522156 L24.2491643,12.3075556 C24.249746,12.226153 24.25,12.1406705 24.25,12.0504571 C24.25,5.42225318 18.7938463,0 12.125,0 Z" id="路径" fill="#333333"></path>
                <path d="M19.6249882,15.1809072 C20.0749705,15.1809072 20.3750059,15.4790319 20.3750059,15.9262189 L20.375,18.9069072 L23.3750295,18.9075832 C23.8250118,18.9075832 24.125,19.2057079 24.125,19.6529419 C24.125,20.1001758 23.6750177,20.3982536 23.3750295,20.3982536 L20.375,20.3979072 L20.3750059,23.3796648 C20.3750059,23.6777895 19.925,24.125 19.6249882,24.125 C19.1750059,24.125 18.8750177,23.8268519 18.8750177,23.3796414 L18.875,20.3979072 L15.8749941,20.3982771 C15.4250118,20.3982771 15.125,20.1001524 15.125,19.6529419 C15.125,19.2057314 15.4249882,18.9075832 15.8749941,18.9075832 L18.875,18.9069072 L18.8750177,15.9262189 C18.8750177,15.4790319 19.1750059,15.1809072 19.6249882,15.1809072 Z" id="形状结合" fill="#26B942"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}
export const stall_settlement = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>摊位结算</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="摊位结算" fill-rule="nonzero">
            <g id="通知设置s" transform="translate(3.000000, 3.000000)">
                <path d="M16.5796414,0.126684658 C16.8525237,0.295597535 17.0136651,0.606092559 16.9990885,0.934895458 L16.999,2.014 L22.5,2.01402351 C23.3284271,2.01402351 24,2.68559638 24,3.51402351 L24,7.56310578 C24,8.3915329 23.3284271,9.06310578 22.5,9.06310578 L21.875,9.063 L21.875,12.5434341 C21.875,13.0266833 21.4832492,13.4184341 21,13.4184341 C20.5539239,13.4184341 20.1858108,13.0846346 20.1318175,12.6531923 L20.125,12.5434341 L20.125,9.146 L3.875,9.146 L3.875,21.2713394 C3.875,21.8512384 4.31376095,22.3286593 4.87741886,22.3897381 L5,22.3963394 L11.5511322,22.3963394 C12.0343814,22.3963394 12.4261322,22.7880903 12.4261322,23.2713394 C12.4261322,23.7174156 12.0923327,24.0855286 11.6608903,24.1395219 L11.5511322,24.1463394 L5,24.1463394 C3.46888915,24.1463394 2.21732499,22.9494578 2.1298805,21.4402675 L2.125,21.2713394 L2.125,9.063 L1.5,9.06310578 C0.671572875,9.06310578 1.01453063e-16,8.3915329 0,7.56310578 L0,3.51402351 C-1.01453063e-16,2.68559638 0.671572875,2.01402351 1.5,2.01402351 L7,2.014 L7.00060774,0.934895458 C6.98877202,0.607888123 7.15053816,0.300337965 7.4222888,0.133194447 C7.69403945,-0.0339490719 8.03230438,-0.0339490719 8.30405503,0.133194447 C8.57580567,0.300337965 8.73757181,0.607888123 8.72573609,0.934895458 L8.725,2.014 L15.273,2.014 L15.2739601,0.934895458 C15.2593835,0.606092559 15.4205249,0.295597535 15.6934072,0.126684658 C15.9662894,-0.0422282193 16.3067592,-0.0422282193 16.5796414,0.126684658 Z M7,3.636 L2.19695282,3.63664246 C1.92081044,3.63664246 1.69695282,3.86050008 1.69695282,4.13664246 L1.69695282,6.95460129 C1.69695282,7.23074366 1.92081044,7.45460129 2.19695282,7.45460129 L21.8025404,7.45460129 C22.0786827,7.45460129 22.3025404,7.23074366 22.3025404,6.95460129 L22.3025404,4.13664246 C22.3025404,3.86050008 22.0786827,3.63664246 21.8025404,3.63664246 L16.999,3.636 L16.9990885,5.1478449 C16.9994233,5.64099944 16.6137929,6.04120606 16.1374323,6.04207052 C15.6605498,6.04207052 15.2739601,5.64185235 15.2739601,5.14815822 L15.273,3.636 L8.725,3.636 L8.72573609,5.1478449 C8.7260707,5.64112159 8.34025614,6.04137881 7.86377722,6.04207052 C7.634798,6.04207052 7.41520158,5.94788076 7.2533172,5.78023067 C7.09143282,5.61258058 7.00052745,5.38520969 7.00060774,5.14815822 L7,3.636 Z" id="形状结合" fill="#333333"></path>
                <path d="M15.7269274,12.2857143 C15.7269274,11.8116071 15.3434637,11.4285714 14.8715084,11.4285714 L7.33340782,11.4285714 C6.86145251,11.4285714 6.47798883,11.8116071 6.47798883,12.2857143 C6.47798883,12.7598214 6.86145251,13.1428571 7.33340782,13.1428571 L14.8715084,13.1428571 C15.3434637,13.1428571 15.7269274,12.7598214 15.7269274,12.2857143 Z" id="路径" fill="#333333"></path>
                <path d="M7.33340782,16.5714286 C6.86145251,16.5714286 6.47798883,16.9544643 6.47798883,17.4285714 C6.47798883,17.9026786 6.86145251,18.2857143 7.33340782,18.2857143 L12.4739665,18.2857143 C12.9459218,18.2857143 13.3293855,17.9026786 13.3293855,17.4285714 C13.3293855,16.9544643 12.9459218,16.5714286 12.4739665,16.5714286 L7.33340782,16.5714286 Z" id="路径" fill="#333333"></path>
                <path d="M20.1774159,15.650568 L22.3025404,17.7995936 L19.8579873,20.2563809 L18.9472197,21.1823191 C18.6436305,21.4794684 18.3717202,21.7527395 18.1288488,21.9994795 C17.8859774,22.2462195 17.6853446,22.4505095 17.5269502,22.6096966 L17.4521162,22.683554 C17.3368036,22.7971099 17.2682394,22.8630694 17.2418403,22.8829678 C17.1652831,22.9519489 17.0781662,23.023583 16.9804896,23.1005235 C16.8828131,23.1774639 16.7798568,23.2384856 16.6742605,23.2835886 C16.5660244,23.336651 16.4102699,23.4003258 16.2069971,23.4772662 C16.0037244,23.5542066 15.789892,23.628494 15.5655,23.7001281 C15.3411079,23.7717623 15.1299154,23.8354372 14.9292826,23.8884995 C14.7286497,23.9415619 14.5781751,23.9760524 14.4804985,23.9919711 C14.2745859,24.0158492 14.1399507,23.9866649 14.0713131,23.9017651 C14.0026755,23.8195185 13.9841962,23.6789032 14.0132352,23.4799193 C14.0290746,23.3737946 14.0633934,23.2199138 14.1214713,23.0182768 C14.1795492,22.8086805 14.2402671,22.5990842 14.3036248,22.3894878 C14.3669826,22.1719322 14.4303403,21.9729483 14.4910582,21.7898832 C14.551776,21.606818 14.6019342,21.4821215 14.6388929,21.4131404 C14.6837713,21.3070157 14.7365694,21.2088503 14.7920075,21.1212974 C14.8500854,21.0337445 14.9319225,20.9355792 15.0375187,20.8294544 C15.085037,20.7843514 15.1906333,20.6755736 15.3569474,20.5031209 C15.5232615,20.3306682 15.731814,20.1210719 15.9826051,19.8690257 L15.9826051,19.8690257 L20.1774159,15.650568 Z M22.3342192,14.0003286 C22.4450953,14.0029817 22.5506915,14.0189005 22.6536479,14.0507379 C22.7566042,14.0825753 22.8437211,14.1170658 22.9202784,14.1542095 C23.0786728,14.2391093 23.2555465,14.3850307 23.4482596,14.5946271 C23.6409728,14.8042234 23.7914474,15.0244322 23.8970437,15.2526003 C23.9287225,15.3189283 23.9524817,15.4011749 23.970961,15.491381 C23.9894404,15.5842401 24,15.6797523 24,15.7779177 C24,15.8760831 23.9815207,15.9769016 23.944562,16.0750669 C23.9076033,16.1758854 23.8468854,16.2713977 23.7624084,16.3616037 C23.6700117,16.4518097 23.5881746,16.5314032 23.5168972,16.6003843 C23.4456197,16.6693654 23.382262,16.7303871 23.3294638,16.7834494 C23.268746,16.8444712 23.2106681,16.8975335 23.1578699,16.9426365 L23.1578699,16.9426365 L21.0327455,14.8068765 C21.1251422,14.7246299 21.2333784,14.6211582 21.357454,14.5044211 C21.4815296,14.3850307 21.5844859,14.2921716 21.6689629,14.2231905 C21.7745591,14.1382908 21.8854352,14.0799222 21.9989512,14.0454316 C22.1124671,14.0109411 22.2233432,13.9976755 22.3342192,14.0003286 Z" id="形状结合" fill="#26B942"></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const settlement = () => {
  return (
    `
<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>编组 31备份 4</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="编组-31备份-4">
            <rect id="矩形" opacity="0" fill-rule="nonzero" x="0" y="0" width="30" height="30"></rect>
            <g id="财务结算日">
                <path d="M23.3240894,2.875 L6.61085077,2.875 C5.10269344,2.875 3.875,4.1002252 3.875,5.60560173 L3.875,24.4855356 C3.875,25.9909121 5.10269344,27.2161373 6.61085077,27.2161373 L15.9414182,27.2161373 L15.6558739,26.9926947 C15.1904626,26.6285036 14.770826,26.2030843 14.4158769,25.7342432 L14.3162165,25.6846939 L6.61085077,25.6846939 C5.94686586,25.6846939 5.40902497,25.1479343 5.40902497,24.4855356 L5.40902497,5.60560173 C5.40902497,4.94320305 5.94686586,4.40644348 6.61085077,4.40644348 L23.3240894,4.40644348 C23.9880743,4.40644348 24.5259152,4.94320305 24.5259152,5.60560173 L24.5259152,14.3125361 L24.5961499,14.4249005 C25.0434217,14.6428964 25.4641809,14.9092789 25.8571104,15.2219306 L26.0599402,15.3833212 L26.0599402,5.60560173 C26.0599402,4.1002252 24.8322468,2.875 23.3240894,2.875 Z" id="形状" fill="#333333" fill-rule="nonzero"></path>
                <g id="记录" transform="translate(15.379574, 15.500000)" fill-rule="nonzero">
                    <g id="编组-13">
                        <path d="M6,0 C9.30939227,0 12,2.69060773 12,6 C12,9.30939227 9.30939227,12 6,12 C2.69060773,12 0,9.30939227 0,6 C0,2.69060773 2.69060773,0 6,0 Z M6,1.32596685 C3.4198895,1.32596685 1.32596685,3.4198895 1.32596685,6 C1.32596685,8.5801105 3.4198895,10.6740331 6,10.6740331 C8.5801105,10.6740331 10.6740331,8.57458564 10.6740331,6 C10.6740331,3.42541436 8.5801105,1.32596685 6,1.32596685 Z" id="形状结合" stroke="#333333" stroke-width="0.25" fill="#333333"></path>
                        <path d="M4.74994085,3.16119704 C4.33585689,3.16119704 4.00017552,3.49687841 4.00017552,3.91096237 L4.00017552,7.16119704 C4.00017552,7.71348179 4.44789077,8.16119704 5.00017552,8.16119704 L8.25041019,8.16119704 C8.66449414,8.16119704 9.00017552,7.82551566 9.00017552,7.4114317 C9.00017552,6.99734775 8.66449414,6.66166637 8.25041019,6.66166637 L5.49970618,6.66166637 L5.49970618,6.66166637 L5.49970618,3.91096237 C5.49970618,3.49687841 5.16402481,3.16119704 4.74994085,3.16119704 Z" id="路径" fill="#26B942"></path>
                    </g>
                </g>
                <path d="M16.2208536,12.8275443 C16.611127,12.8275443 16.9304027,13.1153749 16.9809051,13.4893027 L16.987866,13.5932661 L16.987866,15.8304528 L16.9334996,15.9335833 C16.4877121,16.2389008 16.0776122,16.599135 15.7157805,17.0024701 L15.5045743,17.2495487 L15.4076377,17.2956291 L13.2782963,17.2956291 C12.891384,17.2956291 12.5693074,17.0063779 12.5183149,16.6335156 L12.5112839,16.5299074 L12.5112839,13.5932661 C12.5112839,13.2069012 12.8011177,12.885453 13.1745372,12.8345613 L13.2782963,12.8275443 L16.2208536,12.8275443 Z M15.453,14.358 L14.045,14.358 L14.045,15.764 L15.453,15.764 L15.453,14.358 Z" id="形状结合" fill="#333333" fill-rule="nonzero"></path>
                <path d="M10.5845697,12.875 C10.9714821,12.875 11.2935586,13.1642512 11.3445512,13.5371135 L11.3515822,13.6407217 L11.3515822,16.577363 C11.3515822,16.9637279 11.0617483,17.2851761 10.6883288,17.3360678 L10.5845697,17.3430848 L7.64201248,17.3430848 C7.25510013,17.3430848 6.93302355,17.0538336 6.88203101,16.6809713 L6.875,16.577363 L6.875,13.6407217 C6.875,13.2543569 7.16483388,12.9329086 7.53825339,12.882017 L7.64201248,12.875 L10.5845697,12.875 Z M9.817,14.406 L8.409,14.406 L8.409,15.811 L9.817,15.811 L9.817,14.406 Z" id="形状结合" fill="#333333" fill-rule="nonzero"></path>
                <path d="M7.69011267,19.1644008 L10.6326699,19.1644008 C10.9201412,19.1644008 11.1496824,19.3948047 11.1496824,19.6801226 L11.1496824,22.6167639 C11.1496824,22.9000689 10.9167974,23.1324856 10.6326699,23.1324856 L7.69011267,23.1324856 C7.40598515,23.1324856 7.17310018,22.9000689 7.17310018,22.6167639 L7.17310018,19.6801226 C7.17310018,19.3968176 7.40598515,19.1644008 7.69011267,19.1644008 Z M9.99065741,20.1958443 L8.33212515,20.1958443 L8.20712515,20.3208443 L8.20712515,21.9760421 L8.33212515,22.1010421 L9.99065741,22.1010421 L10.1156574,21.9760421 L10.1156574,20.3208443 L9.99065741,20.1958443 Z" id="形状结合" stroke="#333333" stroke-width="0.25" fill="#333333" fill-rule="nonzero"></path>
                <path d="M13.1750799,23.2 L13.8507987,23.2 C13.7309904,22.6683544 13.6686901,22.1101266 13.6686901,21.5359494 C13.6686901,21.1531646 13.6974441,20.7810127 13.7501597,20.4194937 L13.7501597,20.2759494 L13.7741214,20.2759494 C13.8460064,19.8346835 13.95623,19.4093671 14.1,19 L13.1750799,19 C12.8587859,19 12.6,19.2870886 12.6,19.6379747 L12.6,22.5620253 C12.6,22.9182278 12.8587859,23.2 13.1750799,23.2 Z" id="路径" fill="#333333"></path>
                <path d="M21.0172726,5.875 C21.7569369,5.875 22.3666423,6.4400575 22.435813,7.16063143 L22.4423479,7.29746152 L22.4423479,9.89865859 C22.4368142,10.6382095 21.8737983,11.2448717 21.1539785,11.3136848 L21.0172726,11.3201854 L8.30007528,11.3201854 C7.56041101,11.3201854 6.95070553,10.7551279 6.88153487,10.034554 L6.875,9.89772391 L6.875,7.29746152 C6.875,6.5590478 7.44119582,5.9505542 8.16301142,5.88152178 L8.30007528,5.875 L21.0172726,5.875 Z M20.908,7.406 L8.409,7.406 L8.409,9.788 L20.908,9.788 L20.908,7.406 Z" id="形状结合" fill="#333333" fill-rule="nonzero"></path>
                <path d="M21.5620253,12.9 L18.6379747,12.9 C18.2870886,12.9 18,13.1660099 18,13.491133 L18,14.9 C18.4093671,14.7472906 18.8346835,14.6241379 19.2759494,14.5453202 L19.2759494,14.082266 L20.9240506,14.082266 L20.9240506,14.4221675 C21.36,14.4369458 21.7853165,14.491133 22.2,14.579803 L22.2,13.491133 C22.2,13.1660099 21.9182278,12.9 21.5620253,12.9 Z" id="路径" fill="#333333"></path>
            </g>
            <g id="编组-31备份-2"></g>
        </g>
    </g>
</svg>
    `
  )
}


export const search = (width = 18, height = 18) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg">
    
    <g id="商品" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linejoin="round">
        <g  transform="translate(-41.000000, -737.000000)" stroke="#333333">
            <g id="编组-8" transform="translate(0.000000, 730.000000)">
                <g id="编组-5" transform="translate(30.000000, 8.000000)">
                    <g id="搜索_search-tab" transform="translate(12.000000, 0.000000)">
                        <path d="M7.21353386,14.4270677 C11.1974413,14.4270677 14.4270677,11.1974413 14.4270677,7.21353386 C14.4270677,3.22962641 11.1974413,0 7.21353386,0 C3.22962641,0 0,3.22962641 0,7.21353386 C0,11.1974413 3.22962641,14.4270677 7.21353386,14.4270677 Z" id="路径"></path>
                        <line x1="12.3994707" y1="12.3995131" x2="16" y2="16.0000424" id="路径" stroke-linecap="round"></line>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>
    `
  )
}

export const addGoods = (width = 18, height = 18) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 17 16" version="1.1" xmlns="http://www.w3.org/2000/svg">
   
    <g id="商品" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g  transform="translate(-179.000000, -738.000000)">
            <g id="编组-8" transform="translate(0.000000, 730.000000)">
                <g id="编组-6" transform="translate(167.500000, 8.000000)">
                    <g id="添加_add" transform="translate(12.000000, 0.000000)">
                        <path d="M1,7 L0,7 L0,2 C0,0.343145751 0.343145751,0 2,0 L7,0 L7,1 L2,1 C1.44771525,1 1,1.44771525 1,2 L1,7 Z" id="路径" fill="#333333" fill-rule="nonzero"></path>
                        <path d="M1,16 L0,16 L0,11 C0,9.34314575 0.343145751,9 2,9 L7,9 L7,10 L2,10 C1.44771525,10 1,10.4477153 1,11 L1,16 Z" id="路径备份-3" fill="#333333" fill-rule="nonzero" transform="translate(3.500000, 12.500000) scale(1, -1) translate(-3.500000, -12.500000) "></path>
                        <path d="M10,7 L9,7 L9,2 C9,0.343145751 9.34314575,0 11,0 L16,0 L16,1 L11,1 C10.4477153,1 10,1.44771525 10,2 L10,7 Z" id="路径备份-2" fill="#333333" fill-rule="nonzero" transform="translate(12.500000, 3.500000) scale(-1, 1) translate(-12.500000, -3.500000) "></path>
                        <path d="M10,16 L9,16 L9,11 C9,9.34314575 9.34314575,9 11,9 L16,9 L16,10 L11,10 C10.4477153,10 10,10.4477153 10,11 L10,16 Z" id="路径备份-4" fill="#333333" fill-rule="nonzero" transform="translate(12.500000, 12.500000) scale(-1, -1) translate(-12.500000, -12.500000) "></path>
                        <line x1="8" y1="4.44444444" x2="8" y2="12.4444444" id="路径" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"></line>
                        <line x1="4" y1="8.22222222" x2="12" y2="8.22222222" id="路径" stroke="#333333" stroke-linecap="round" stroke-linejoin="round"></line>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>
  `)
}

export const bottom_tab_workbench = () => {
  return (
    `
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>工作台</title>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="编组">
            <rect id="矩形" opacity="0" x="0" y="0" width="24" height="24"></rect>
            <g id="工作台_workbench-(1)" transform="translate(2.000000, 3.000000)" fill="#666666" fill-rule="nonzero">
                <path d="M19.3007246,0 L0.75,0 C0.335786438,0 0,0.335786438 0,0.75 L0,12.807971 C0,13.2221846 0.335786438,13.557971 0.75,13.557971 L19.3007246,13.557971 C19.7149382,13.557971 20.0507246,13.2221846 20.0507246,12.807971 L20.0507246,0.75 C20.0507246,0.335786438 19.7149382,0 19.3007246,0 Z M18.55,1.5 L18.55,12.057 L1.5,12.057 L1.5,1.5 L18.55,1.5 Z" id="路径"></path>
                <path d="M6.31521739,6.95652174 C6.69491316,6.95652174 7.00870835,7.23867562 7.05837078,7.60475118 L7.06521739,7.70652174 L7.06521739,9.5615942 C7.06521739,9.97580777 6.72943095,10.3115942 6.31521739,10.3115942 C5.93552163,10.3115942 5.62172643,10.0294403 5.57206401,9.66336476 L5.56521739,9.5615942 L5.56521739,7.70652174 C5.56521739,7.29230818 5.90100383,6.95652174 6.31521739,6.95652174 Z" id="路径"></path>
                <path d="M10.0253623,12.057971 C10.4050581,12.057971 10.7188533,12.3401249 10.7685157,12.7062005 L10.7753623,12.807971 L10.7753623,15.5905797 C10.7753623,16.0047933 10.4395759,16.3405797 10.0253623,16.3405797 C9.64566655,16.3405797 9.33187136,16.0584258 9.28220893,15.6923503 L9.27536232,15.5905797 L9.27536232,12.807971 C9.27536232,12.3937575 9.61114876,12.057971 10.0253623,12.057971 Z" id="路径"></path>
                <path d="M10.0253623,5.10144928 C10.4050581,5.10144928 10.7188533,5.38360316 10.7685157,5.74967872 L10.7753623,5.85144928 L10.7753623,9.5615942 C10.7753623,9.97580777 10.4395759,10.3115942 10.0253623,10.3115942 C9.64566655,10.3115942 9.33187136,10.0294403 9.28220893,9.66336476 L9.27536232,9.5615942 L9.27536232,5.85144928 C9.27536232,5.43723571 9.61114876,5.10144928 10.0253623,5.10144928 Z" id="路径"></path>
                <path d="M13.7355072,3.24637681 C14.115203,3.24637681 14.4289982,3.52853069 14.4786606,3.89460625 L14.4855072,3.99637681 L14.4855072,9.5615942 C14.4855072,9.97580777 14.1497208,10.3115942 13.7355072,10.3115942 C13.3558115,10.3115942 13.0420163,10.0294403 12.9923539,9.66336476 L12.9855072,9.5615942 L12.9855072,3.99637681 C12.9855072,3.58216325 13.3212937,3.24637681 13.7355072,3.24637681 Z" id="路径"></path>
                <path d="M15.5905797,15.7681159 C16.0047933,15.7681159 16.3405797,16.1039024 16.3405797,16.5181159 C16.3405797,16.8978117 16.0584258,17.2116069 15.6923503,17.2612693 L15.5905797,17.2681159 L4.46014493,17.2681159 C4.04593137,17.2681159 3.71014493,16.9323295 3.71014493,16.5181159 C3.71014493,16.1384202 3.99229881,15.824625 4.35837437,15.7749626 L4.46014493,15.7681159 L15.5905797,15.7681159 Z" id="路径"></path>
            </g>
        </g>
    </g>
</svg>
  `)
}


export const bottom_tab_workbench_check = () => {
  return (
    `
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>工作台-hover</title>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="工作台">
            <rect id="矩形" fill="#D8D8D8" opacity="0" x="0" y="0" width="24" height="24"></rect>
            <g id="工作台_workbench" transform="translate(2.000000, 3.000000)" fill="#59B26A" fill-rule="nonzero">
                <path d="M19.5507246,0 C20.1030094,0 20.5507246,0.44771525 20.5507246,1 L20.5507246,1 L20.5507246,13.057971 C20.5507246,13.6102558 20.1030094,14.057971 19.5507246,14.057971 L19.5507246,14.057971 L1,14.057971 C0.44771525,14.057971 0,13.6102558 0,13.057971 L0,13.057971 L0,1 C0,0.44771525 0.44771525,0 1,0 L1,0 Z M6.56521739,7.20652174 C6.15100383,7.20652174 5.81521739,7.54230818 5.81521739,7.95652174 L5.81521739,7.95652174 L5.81521739,9.8115942 L5.82206401,9.91336476 C5.87172643,10.2794403 6.18552163,10.5615942 6.56521739,10.5615942 C6.97943095,10.5615942 7.31521739,10.2258078 7.31521739,9.8115942 L7.31521739,9.8115942 L7.31521739,7.95652174 L7.30837078,7.85475118 C7.25870835,7.48867562 6.94491316,7.20652174 6.56521739,7.20652174 Z M10.2753623,5.35144928 C9.86114876,5.35144928 9.52536232,5.68723571 9.52536232,6.10144928 L9.52536232,6.10144928 L9.52536232,9.8115942 L9.53220893,9.91336476 C9.58187136,10.2794403 9.89566655,10.5615942 10.2753623,10.5615942 C10.6895759,10.5615942 11.0253623,10.2258078 11.0253623,9.8115942 L11.0253623,9.8115942 L11.0253623,6.10144928 L11.0185157,5.99967872 C10.9688533,5.63360316 10.6550581,5.35144928 10.2753623,5.35144928 Z M13.9855072,3.49637681 C13.5712937,3.49637681 13.2355072,3.83216325 13.2355072,4.24637681 L13.2355072,4.24637681 L13.2355072,9.8115942 L13.2423539,9.91336476 C13.2920163,10.2794403 13.6058115,10.5615942 13.9855072,10.5615942 C14.3997208,10.5615942 14.7355072,10.2258078 14.7355072,9.8115942 L14.7355072,9.8115942 L14.7355072,4.24637681 L14.7286606,4.14460625 C14.6789982,3.77853069 14.365203,3.49637681 13.9855072,3.49637681 Z" id="形状结合"></path>
                <path d="M10.2753623,12.057971 C10.7881982,12.057971 11.2108695,12.4440112 11.2686346,12.9413499 L11.2753623,13.057971 L11.2753623,15.8405797 C11.2753623,16.3928645 10.8276471,16.8405797 10.2753623,16.8405797 C9.76252648,16.8405797 9.33985516,16.4545395 9.28209005,15.9572008 L9.27536232,15.8405797 L9.27536232,13.057971 C9.27536232,12.5056863 9.72307757,12.057971 10.2753623,12.057971 Z" id="路径"></path>
                <path d="M15.8405797,15.7681159 C16.3928645,15.7681159 16.8405797,16.2158312 16.8405797,16.7681159 C16.8405797,17.2809518 16.4545395,17.7036231 15.9572008,17.7613882 L15.8405797,17.7681159 L4.71014493,17.7681159 C4.15786018,17.7681159 3.71014493,17.3204007 3.71014493,16.7681159 C3.71014493,16.2552801 4.09618512,15.8326088 4.5935238,15.7748437 L4.71014493,15.7681159 L15.8405797,15.7681159 Z" id="路径"></path>
            </g>
        </g>
    </g>
</svg>
  `)
}

export const bottom_tab_goods = () => {
  return (
    `
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>商品</title>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="编组">
            <rect id="矩形" opacity="0" x="0" y="0" width="24" height="24"></rect>
            <g id="商品_commodity" transform="translate(3.000000, 4.000000)" fill="#666666" fill-rule="nonzero">
                <path d="M14.9845642,-0.75 L2.75016415,-0.75 C1.86757881,-0.75 1.12313281,-0.0928200404 1.01366097,0.782937119 L-0.736339244,14.7829239 C-0.866898306,15.8274138 -0.0524747273,16.75 1.00014415,16.75 L16.7345642,16.75 C17.7871833,16.75 18.6016237,15.8274202 18.4710735,14.7829316 L16.7210725,0.782938851 C16.6116097,-0.0928164862 15.8671518,-0.75 14.9845642,-0.75 Z M2.75016415,0.75 L14.9845642,0.75 C15.1106702,0.75 15.2170178,0.843880247 15.2326551,0.96898556 L16.9826558,14.9689761 C17.0013052,15.1181844 16.8849403,15.25 16.7345642,15.25 L1.00014415,15.25 C0.849779916,15.25 0.733425754,15.118193 0.752077751,14.9689745 L2.50207755,0.968991149 C2.51771696,0.843878344 2.62406128,0.75 2.75016415,0.75 Z" id="路径"></path>
                <path d="M4.03195395,4.32917961 C4.37156417,4.1593745 4.77841418,4.27140712 4.98654757,4.57662535 L5.03818454,4.6645898 C5.11266344,4.8135476 5.33528031,5.09474785 5.74599292,5.39344794 C6.47616647,5.92448324 7.49340634,6.25 8.86736415,6.25 C10.241322,6.25 11.2585618,5.92448324 11.9887354,5.39344794 C12.3538133,5.12793675 12.5702723,4.87625259 12.6661761,4.71898287 L12.6965438,4.6645898 C12.8817857,4.29410593 13.3322905,4.14393767 13.7027743,4.32917961 C14.0732582,4.51442154 14.2234265,4.96492632 14.0381845,5.3354102 C13.8626634,5.6864524 13.4915303,6.15525215 12.8709929,6.60655206 C11.8824165,7.32551676 10.5559063,7.75 8.86736415,7.75 C7.17882196,7.75 5.85231184,7.32551676 4.86373538,6.60655206 C4.24319799,6.15525215 3.87206486,5.6864524 3.69654376,5.3354102 C3.51130182,4.96492632 3.66147008,4.51442154 4.03195395,4.32917961 Z" id="路径"></path>
            </g>
        </g>
    </g>
</svg>
  `)
}

export const bottom_tab_goods_check = () => {
  return (
    `
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>商品-hover</title>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="商品_commodity-(1)" transform="translate(1.999853, 3.000000)" fill="#59B26A" fill-rule="nonzero">
            <path d="M15.9847112,0 C16.9933791,0 17.8441888,0.751067392 17.9692891,1.75193013 L17.9692891,1.75193013 L19.7192904,15.7519255 C19.8684905,16.9456261 18.9377042,18 17.7347112,18 L17.7347112,18 L2.00029124,18 C0.797296585,18 -0.133471896,16.9456173 0.0157383772,15.7519151 L0.0157383772,15.7519151 L1.76573867,1.75192782 C1.8908492,0.751063562 2.74164548,0 3.75031124,0 L3.75031124,0 Z M5.98669465,5.57662535 C5.77856126,5.27140712 5.37171126,5.1593745 5.03210104,5.32917961 C4.66161717,5.51442154 4.51144891,5.96492632 4.69669084,6.3354102 C4.87221194,6.6864524 5.24334508,7.15525215 5.86388246,7.60655206 C6.85245892,8.32551676 8.17896905,8.75 9.86751124,8.75 C11.5560534,8.75 12.8825636,8.32551676 13.87114,7.60655206 C14.4916774,7.15525215 14.8628105,6.6864524 15.0383316,6.3354102 C15.2235736,5.96492632 15.0734053,5.51442154 14.7029214,5.32917961 C14.3324376,5.14393767 13.8819328,5.29410593 13.6966908,5.6645898 L13.6966908,5.6645898 L13.6663231,5.71898287 C13.5704194,5.87625259 13.3539603,6.12793675 12.9888825,6.39344794 C12.2587089,6.92448324 11.241469,7.25 9.86751124,7.25 C8.49355343,7.25 7.47631355,6.92448324 6.74614001,6.39344794 C6.33542739,6.09474785 6.11281053,5.8135476 6.03833163,5.6645898 L6.03833163,5.6645898 Z" id="形状结合"></path>
        </g>
    </g>
</svg>
  `)
}

export const bottom_tab_message = () => {
  return (
    `
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>消息</title>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="编组">
            <rect id="矩形" opacity="0" x="0" y="0" width="24" height="24"></rect>
            <g id="提醒_remind-(1)" transform="translate(3.250000, 3.250000)">
                <path d="M8.75,0.75 C5.6572,0.75 3.15,3.2572 3.15,6.35 L3.15,14.35 L14.35,14.35 L14.35,6.35 C14.35,3.2572 11.8428,0.75 8.75,0.75 Z" id="路径"></path>
                <path d="M0.75,15.1 C0.335786438,15.1 0,14.7642136 0,14.35 C0,13.9703042 0.282153882,13.656509 0.648229443,13.6068466 L0.75,13.6 L2.4,13.6 L2.4,6.35 C2.4,2.84298644 5.24298644,0 8.75,0 C12.1807741,0 14.9760781,2.7207219 15.0959917,6.12224555 L15.1,6.35 L15.1,13.6 L16.75,13.6 C17.1642136,13.6 17.5,13.9357864 17.5,14.35 C17.5,14.7296958 17.2178461,15.043491 16.8517706,15.0931534 L16.75,15.1 L0.75,15.1 Z M8.75,1.5 C6.14380779,1.5 4.01774418,3.55562599 3.90472554,6.13396158 L3.9,6.35 L3.9,13.6 L13.6,13.6 L13.6,6.35 C13.6,3.67141356 11.4285864,1.5 8.75,1.5 Z" id="形状" fill="#666666" fill-rule="nonzero"></path>
                <path d="M10.75,13.6 L6.75,13.6 C6.33578644,13.6 6,13.9357864 6,14.35 L6,14.75 C6,16.2687736 7.23122644,17.5 8.75,17.5 C10.2687736,17.5 11.5,16.2687736 11.5,14.75 L11.5,14.35 C11.5,13.9357864 11.1642136,13.6 10.75,13.6 Z M9.948,15.1 L9.94380166,15.1217082 C9.78553524,15.6305412 9.31090648,16 8.75,16 L8.62219633,15.9935463 C8.11794568,15.9423355 7.70229042,15.5914002 7.55619834,15.1217082 L7.551,15.1 L9.948,15.1 Z" id="路径" fill="#666666" fill-rule="nonzero"></path>
            </g>
        </g>
    </g>
</svg>
  `)
}

export const bottom_tab_message_check = () => {
  return (
    `
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>消息-hover</title>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="提醒_remind-(2)" transform="translate(3.000000, 3.000000)" fill="#59B26A" fill-rule="nonzero">
            <path d="M9,1 C5.9072,1 3.4,3.5072 3.4,6.6 L3.4,14.6 L14.6,14.6 L14.6,6.6 C14.6,3.5072 12.0928,1 9,1 Z" id="路径"></path>
            <path d="M1,15.6 C0.44771525,15.6 0,15.1522847 0,14.6 C0,14.0871642 0.38604019,13.6644928 0.883378875,13.6067277 L1,13.6 L2.4,13.6 L2.4,6.6 C2.4,2.95491525 5.35491525,0 9,0 C12.5675298,0 15.4739465,2.83051185 15.5960088,6.36829414 L15.6,6.6 L15.6,13.6 L17,13.6 C17.5522847,13.6 18,14.0477153 18,14.6 C18,15.1128358 17.6139598,15.5355072 17.1166211,15.5932723 L17,15.6 L1,15.6 Z" id="形状"></path>
            <path d="M11,13.6 L7,13.6 C6.44771525,13.6 6,14.0477153 6,14.6 L6,15 C6,16.6568447 7.34315525,18 9,18 C10.6568447,18 12,16.6568447 12,15 L12,14.6 C12,14.0477153 11.5522847,13.6 11,13.6 Z" id="路径"></path>
        </g>
    </g>
</svg>
  `)
}

export const bottom_tab_control = () => {
  return (
    `
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>配送 2</title>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="编组">
            <rect id="矩形" opacity="0" x="0" y="0" width="24" height="24"></rect>
            <g id="仪表盘_dashboard-car" transform="translate(4.000000, 4.000000)" fill="#666666" fill-rule="nonzero">
                <path d="M8,-0.75 C12.8325045,-0.75 16.75,3.16749553 16.75,8 C16.75,9.95914492 16.103434,11.8219323 14.931238,13.3410807 C14.6781968,13.6690182 14.2072205,13.7297337 13.879283,13.4766926 C13.5513454,13.2236514 13.4906299,12.7526751 13.7436711,12.4247375 C14.7150436,11.1658533 15.25,9.62461855 15.25,8 C15.25,3.99592265 12.0040773,0.75 8,0.75 C3.99592265,0.75 0.75,3.99592265 0.75,8 C0.75,9.62462762 1.28495163,11.165861 2.25632087,12.4247365 C2.5093626,12.7526736 2.44864789,13.2236501 2.12071076,13.4766918 C1.79277364,13.7297335 1.32179722,13.6690188 1.06875549,13.3410817 C-0.103439203,11.8219403 -0.75,9.95915305 -0.75,8 C-0.75,3.16749553 3.16749553,-0.75 8,-0.75 Z" id="路径"></path>
                <path d="M8,2.15909091 C11.2258499,2.15909091 13.8409091,4.77415007 13.8409091,8 C13.8409091,9.15696563 13.5031161,10.2656394 12.8794179,11.2115737 C12.6514092,11.5573842 12.1862368,11.6528813 11.8404263,11.4248725 C11.4946158,11.1968637 11.3991187,10.7316913 11.6271275,10.3858808 C12.0904565,9.68317112 12.3409091,8.86115805 12.3409091,8 C12.3409091,5.6025772 10.3974228,3.65909091 8,3.65909091 C5.6025772,3.65909091 3.65909091,5.6025772 3.65909091,8 C3.65909091,8.86115805 3.90954355,9.68317112 4.37287249,10.3858808 C4.60088127,10.7316913 4.50538415,11.1968637 4.1595737,11.4248725 C3.81376325,11.6528813 3.34859084,11.5573842 3.12058206,11.2115737 C2.4968839,10.2656394 2.15909091,9.15696563 2.15909091,8 C2.15909091,4.77415007 4.77415007,2.15909091 8,2.15909091 Z" id="路径"></path>
                <path d="M7.46966991,9.6514881 L1.6514881,15.4696699 C1.17901445,15.9421436 1.51363954,16.75 2.18181818,16.75 L13.8181818,16.75 C14.4863605,16.75 14.8209855,15.9421436 14.3485119,15.4696699 L8.53033009,9.6514881 C8.23743687,9.35859488 7.76256313,9.35859488 7.46966991,9.6514881 Z M8,11.243 L12.006,15.249 L3.993,15.249 L8,11.243 Z" id="路径"></path>
            </g>
        </g>
    </g>
</svg>
  `)
}

export const bottom_tab_control_check = () => {
  return (
    `
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>配送-hover</title>
    <g id="工作台-新订单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="仪表盘_dashboard-car-(1)" transform="translate(4.000000, 4.000000)" fill="#59B26A">
            <path d="M8,-0.75 C12.8325045,-0.75 16.75,3.16749553 16.75,8 C16.75,9.95914492 16.103434,11.8219323 14.931238,13.3410807 C14.6781968,13.6690182 14.2072205,13.7297337 13.879283,13.4766926 C13.5513454,13.2236514 13.4906299,12.7526751 13.7436711,12.4247375 C14.7150436,11.1658533 15.25,9.62461855 15.25,8 C15.25,3.99592265 12.0040773,0.75 8,0.75 C3.99592265,0.75 0.75,3.99592265 0.75,8 C0.75,9.62462762 1.28495163,11.165861 2.25632087,12.4247365 C2.5093626,12.7526736 2.44864789,13.2236501 2.12071076,13.4766918 C1.79277364,13.7297335 1.32179722,13.6690188 1.06875549,13.3410817 C-0.103439203,11.8219403 -0.75,9.95915305 -0.75,8 C-0.75,3.16749553 3.16749553,-0.75 8,-0.75 Z" id="路径" fill-rule="nonzero"></path>
            <path d="M8,2.15909091 C11.2258499,2.15909091 13.8409091,4.77415007 13.8409091,8 C13.8409091,9.15696563 13.5031161,10.2656394 12.8794179,11.2115737 C12.6514092,11.5573842 12.1862368,11.6528813 11.8404263,11.4248725 C11.4946158,11.1968637 11.3991187,10.7316913 11.6271275,10.3858808 C12.0904565,9.68317112 12.3409091,8.86115805 12.3409091,8 C12.3409091,5.6025772 10.3974228,3.65909091 8,3.65909091 C5.6025772,3.65909091 3.65909091,5.6025772 3.65909091,8 C3.65909091,8.86115805 3.90954355,9.68317112 4.37287249,10.3858808 C4.60088127,10.7316913 4.50538415,11.1968637 4.1595737,11.4248725 C3.81376325,11.6528813 3.34859084,11.5573842 3.12058206,11.2115737 C2.4968839,10.2656394 2.15909091,9.15696563 2.15909091,8 C2.15909091,4.77415007 4.77415007,2.15909091 8,2.15909091 Z" id="路径" fill-rule="nonzero"></path>
            <polygon id="路径" stroke="#59B26A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="8 10.1818182 13.8181818 16 2.18181818 16"></polygon>
        </g>
    </g>
</svg>
  `)
}

export const check_icon = () => {
  return (
    `
<svg width="18px" height="18px" viewBox="0 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>勾选</title>
    <g id="注册" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="勾选">
            <rect id="BG" fill-opacity="0" fill="#FFFFFF" x="0" y="0" width="18" height="18"></rect>
            <path d="M14,2 C15.1045695,2 16,2.8954305 16,4 L16,14 C16,15.1045695 15.1045695,16 14,16 L4,16 C2.8954305,16 2,15.1045695 2,14 L2,4 C2,2.8954305 2.8954305,2 4,2 L14,2 Z M13.4063596,5.14053798 L7.55,11.089 L4.62077218,7.84522532 L3.65467905,8.81207708 L3.88267905,9.06253798 L3.83773648,9.10796911 L4.90667905,10.187538 L7.04488826,12.5391676 L7.08980436,12.5821325 L7.18536514,12.6505643 C7.44998282,12.8089191 7.78528929,12.7746444 8.00833887,12.5575501 L8.00833887,12.5575501 L12.4156791,8.08853798 L14.1521914,6.417902 L14.1086791,6.37253798 L14.3480744,6.13011494 L13.4063596,5.14053798 Z" id="形状结合" fill="#26B942"></path>
        </g>
    </g>
</svg>
  `)
}

export const check_circle_icon = () => {
  return (
    `
<svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>编组 35@3x</title>
    <g id="我的" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="编组-35">
            <circle id="椭圆形" stroke="#26B942" fill="#26B942" cx="10" cy="10" r="9.5"></circle>
            <path d="M15.2839918,6 L16,6.71657045 L8.60076401,13.8610262 C8.40930565,14.0384991 8.11196135,14.0455782 7.91207687,13.8846522 L7.87579028,13.8525103 L4,9.79448823 L4.73393926,9.09494957 L8.25151289,12.8042925 L15.2839918,6 Z" id="单选轮廓" stroke="#FFFFFF" stroke-width="0.6" fill="#FFFFFF" fill-rule="nonzero"></path>
        </g>
    </g>
</svg>
  `)
}

export const cross_icon = () => {
  return (
    `
<svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>叉号</title>
    <g id="手动发单" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="手动发单--期望送达时间" transform="translate(-331.000000, -528.000000)">
            <g id="编组-8" transform="translate(0.000000, 513.000000)">
                <g id="编组-11" transform="translate(331.000000, 15.000000)">
                    <rect id="BG" fill="#FFFFFF" opacity="0" x="7" y="7" width="18" height="18"></rect>
                    <path d="M21.5202201,10.1464466 C21.7032783,10.3295049 21.7147195,10.6191923 21.5545435,10.8155793 L21.5202201,10.8535534 L16.54,15.8333333 L21.5202201,20.8131133 C21.7154822,21.0083754 21.7154822,21.3249579 21.5202201,21.5202201 C21.3371618,21.7032783 21.0474743,21.7147195 20.8510874,21.5545435 L20.8131133,21.5202201 L15.8333333,16.54 L10.8535534,21.5202201 C10.6582912,21.7154822 10.3417088,21.7154822 10.1464466,21.5202201 C9.96338835,21.3371618 9.95194721,21.0474743 10.1121232,20.8510874 L10.1464466,20.8131133 L15.1263333,15.8333333 L10.1464466,10.8535534 C9.95118446,10.6582912 9.95118446,10.3417088 10.1464466,10.1464466 C10.3295049,9.96338835 10.6191923,9.95194721 10.8155793,10.1121232 L10.8535534,10.1464466 L15.8333333,15.1263333 L20.8131133,10.1464466 C21.0083754,9.95118446 21.3249579,9.95118446 21.5202201,10.1464466 Z" id="icon" stroke="#999999" stroke-width="0.5" fill="#999999" fill-rule="nonzero"></path>
                </g>
            </g>
        </g>
    </g>
</svg>
  `)
}

export const cross_circle_icon = () => {
  return (
    `
<svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <title>叉号</title>
    <g id="注册" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="叉号">
            <rect id="BG" fill="#FFFFFF" opacity="0" x="0" y="0" width="20" height="20"></rect>
            <g transform="translate(1.000000, 1.000000)" fill="#CCCCCC" id="形状结合">
                <path d="M8.88888889,0 C13.7980867,0 17.7777778,3.97969111 17.7777778,8.88888889 C17.7777778,13.7980867 13.7980867,17.7777778 8.88888889,17.7777778 C3.97969111,17.7777778 0,13.7980867 0,8.88888889 C0,3.97969111 3.97969111,0 8.88888889,0 Z M5.07640993,4.5430766 L5.00891191,4.6238658 C4.85141651,4.85121197 4.87391586,5.16554043 5.07640993,5.36803451 L8.219,8.511 L5.0448375,11.6886438 C4.84814883,11.9292885 4.86426801,12.2670037 5.07640993,12.4791456 L5.15719914,12.5466436 C5.3845453,12.704139 5.69887377,12.6816397 5.90136784,12.4791456 L9.044,9.335 L12.1875132,12.4791378 L12.2219772,12.5107181 C12.4626218,12.7074067 12.800337,12.6912875 13.012479,12.4791456 L13.079977,12.3983564 C13.2374724,12.1710103 13.214973,11.8566818 13.012479,11.6541877 L9.869,8.511 L13.0124711,5.36804232 L13.0440514,5.33357838 C13.2407401,5.09293375 13.2246209,4.75521852 13.012479,4.5430766 L12.9316898,4.47557857 C12.7043436,4.31808318 12.3900151,4.34058252 12.187521,4.5430766 L9.044,7.686 L5.90136974,4.5430785 L5.85728637,4.50323814 C5.62626708,4.3148155 5.28855185,4.33093468 5.07640993,4.5430766 Z"></path>
            </g>
        </g>
    </g>
</svg>
  `)
}

export const noSearchGoodsData = (width = 122, height = 93) => {
  return (
    `
<svg width="${width}" height="${height}" viewBox="0 0 122 93" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
   
    <defs>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-1">
            <stop stop-color="#CCCCCC" offset="0%"></stop>
            <stop stop-color="#E1E1E1" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="0.318170704%" y1="100%" x2="99.6818293%" y2="0%" id="linearGradient-2">
            <stop stop-color="#F8F8F8" offset="0%"></stop>
            <stop stop-color="#CECECE" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-3">
            <stop stop-color="#EEEEEE" offset="0%"></stop>
            <stop stop-color="#D8D8D8" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id="linearGradient-4">
            <stop stop-color="#F3F3F3" offset="0%"></stop>
            <stop stop-color="#ECECEC" offset="100%"></stop>
        </linearGradient>
        <path d="M17.6874304,48.4388504 L17.6874304,53.2180073 C17.6874304,55.8615694 15.6037585,58 13.034061,58 L58.4373262,58 C58.5159333,58 58.5917807,57.9970782 58.6675445,57.9941564 C59.8639603,57.9336574 60.9366955,57.4140886 61.7286197,56.6003609 C62.5711366,55.7344701 63.0906957,54.5397884 63.0906957,53.2180073 L63.0906957,48.4388504 L17.6874304,48.4388504 Z" id="path-5"></path>
        <linearGradient x1="0%" y1="36.4133436%" x2="90.3184289%" y2="69.5535018%" id="linearGradient-7">
            <stop stop-color="#E7E7E7" offset="0%"></stop>
            <stop stop-color="#CACACA" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-8">
            <stop stop-color="#EEEEEE" offset="0%"></stop>
            <stop stop-color="#D8D8D8" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-9">
            <stop stop-color="#EEEEEE" offset="0%"></stop>
            <stop stop-color="#D8D8D8" offset="100%"></stop>
        </linearGradient>
        <polygon id="path-10" points="4.60784894 0 0 13.6518597 4.60784894 14.8581007"></polygon>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-12">
            <stop stop-color="#EEEEEE" offset="0%"></stop>
            <stop stop-color="#D8D8D8" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-13">
            <stop stop-color="#EEEEEE" offset="0%"></stop>
            <stop stop-color="#D8D8D8" offset="100%"></stop>
        </linearGradient>
        <polygon id="path-14" points="3.42708765 0 0 10.2388948 3.42708765 11.1435755"></polygon>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-16">
            <stop stop-color="#EEEEEE" offset="0%"></stop>
            <stop stop-color="#D8D8D8" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g id="启动界面/缺省界面" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="账号管理-暂无设置" transform="translate(-132.000000, -168.000000)">
            <g id="编组-4" transform="translate(131.994548, 168.000000)">
                <ellipse id="椭圆形" fill="#E7E7E7" cx="60.5768806" cy="84.3888889" rx="54.8571429" ry="8.61111111"></ellipse>
                <g id="编组-2" transform="translate(20.914756, 20.000000)">
                    <path d="M8.51918067,7 C11.5184573,7 13.9475821,9.4964398 13.9475821,12.5756973 L13.9475821,12.5756973 L13.9475821,58.1075796 C13.9475821,59.4293606 14.4699844,60.6241284 15.3096581,61.4899332 L15.3096581,61.4899332 C16.152175,62.3556521 17.3176498,62.8895723 18.6010351,62.8895723 L18.6010351,62.8895723 C21.1705654,62.8895723 23.2544046,60.7510558 23.2544046,58.1075796 L23.2544046,58.1075796 L23.2544046,53.5464423 L54.3508473,53.5464423 L54.3508473,12.5756973 C54.3508473,11.0374435 53.7442351,9.64064035 52.7613963,8.63347083 L52.7613963,8.63347083 C51.7784738,7.62337949 50.4220006,7 48.9224459,7 L48.9224459,7 L8.51918067,7 Z" id="Clip-4"></path>
                    <path d="M3.51918067,0 C6.51845732,0 8.94758207,2.4964398 8.94758207,5.57569731 L8.94758207,53.1075796 C8.94758207,54.4293606 9.46998438,55.6241284 10.3096581,56.4899332 C11.152175,57.3556521 12.3176498,57.8895723 13.6010351,57.8895723 C16.1705654,57.8895723 18.2544046,55.7510558 18.2544046,53.1075796 L18.2544046,48.5464423 L54.3508473,48.5464423 L54.3508473,5.57569731 C54.3508473,4.03744353 53.7442351,2.64064035 52.7613963,1.63347083 C51.7784738,0.623379493 50.4220006,0 48.9224459,0 L3.51918067,0 Z" id="Fill-3" fill="url(#linearGradient-1)"></path>
                    <ellipse id="椭圆形" fill="url(#linearGradient-2)" transform="translate(82.149898, 35.114639) rotate(24.000000) translate(-82.149898, -35.114639) " cx="82.1498979" cy="35.1146393" rx="7.53484289" ry="7.55893157"></ellipse>
                    <ellipse id="椭圆形" fill="url(#linearGradient-2)" transform="translate(82.149898, 35.114639) rotate(24.000000) translate(-82.149898, -35.114639) " cx="82.1498979" cy="35.1146393" rx="7.53484289" ry="7.55893157"></ellipse>
                    <path d="M4.45507778,0.0145231782 C4.36290849,0.0145231782 4.2684058,0.0168206575 4.17850128,0.0258754288 L4.17850128,0.0258754288 C3.05840077,0.0916914534 2.04893086,0.565985782 1.30450772,1.29894925 L1.30450772,1.29894925 C0.497837699,2.09097145 0,3.18923413 0,4.39878941 L0,4.39878941 L0,7.09238116 L8.91008693,7.09238116 L8.91008693,4.39878941 C8.91008693,1.97744895 6.91653999,0.0145231782 4.45507778,0.0145231782 Z" id="Fill-1" fill="url(#linearGradient-3)"></path>
                    <mask id="mask-6" fill="white">
                        <use xlink:href="#path-5"></use>
                    </mask>
                    <use id="Fill-5" fill="url(#linearGradient-4)" xlink:href="#path-5"></use>
                </g>
                <polygon id="Line备份" fill="#ECECEC" fill-rule="nonzero" points="36.3931074 33.3013752 36.3931074 30.8602546 68.8926348 30.8602546 68.8926348 33.3013752"></polygon>
                <polygon id="Line备份-2" fill="#ECECEC" fill-rule="nonzero" points="36.3931074 42.0990366 36.3931074 39.657916 64.944094 39.657916 64.944094 42.0990366"></polygon>
                <polygon id="Line备份-3" fill="#ECECEC" fill-rule="nonzero" points="36.3931074 50.2018381 36.3931074 47.7607175 57.0470126 47.7607175 57.0470126 50.2018381"></polygon>
                <polygon id="Star-Copy-2" fill="#CCCCCC" transform="translate(90.528171, 17.236147) rotate(-45.000000) translate(-90.528171, -17.236147) " points="90.5275333 18.0502611 87.6475865 20.1167316 89.714057 17.2367849 87.6520986 14.3600741 90.5288095 16.4220325 93.4087562 14.355562 91.3422857 17.2355087 93.4042441 20.1122195"></polygon>
                <polygon id="Star" fill="#CCCCCC" transform="translate(83.693458, 36.403958) rotate(-45.000000) translate(-83.693458, -36.403958) " points="83.6919615 38.3125802 80.9921418 39.1052733 81.7848349 36.4054536 80.9963731 33.7068732 83.6949535 34.4953349 86.3947732 33.7026419 85.6020802 36.4024616 86.3905419 39.101042"></polygon>
                <polygon id="Star-Copy-3" fill="#EDEDED" transform="translate(23.985968, 41.381446) rotate(-45.000000) translate(-23.985968, -41.381446) " points="23.8939863 43.3263455 21.105383 44.2620308 22.0410683 41.4734274 21.1098951 38.5053732 24.0779494 39.4365464 26.8665527 38.5008611 25.9308674 41.2894644 26.8620406 44.2575187"></polygon>
                <polygon id="Star-Copy-4" fill="#CCCCCC" transform="translate(26.844949, 67.404192) rotate(-45.000000) translate(-26.844949, -67.404192) " points="26.843702 68.9947108 24.5938522 69.6552883 25.2544298 67.4054386 24.5973783 65.1566216 26.8461953 65.8136731 29.0960451 65.1530955 28.4354675 67.4029453 29.092519 69.6517623"></polygon>
                <polygon id="Star-Copy" fill="#CCCCCC" transform="translate(92.849632, 70.259998) rotate(-45.000000) translate(-92.849632, -70.259998) " points="92.8486777 71.4778356 91.1260005 71.9836302 91.6317951 70.260953 91.1287004 68.5390666 92.8505868 69.0421613 94.573264 68.5363667 94.0674694 70.2590439 94.5705641 71.9809303"></polygon>
                <g id="编组" transform="translate(62.446685, 48.488239)" fill="url(#linearGradient-7)">
                    <path d="M12.8438465,3.06435826 L13.1937339,3.07097368 C14.8276042,3.12919885 16.4732348,3.57126642 17.9997101,4.43486447 L17.9997101,4.43486447 L18.2585279,4.58605001 C22.9795118,7.43223346 24.7796521,13.4466153 22.48981,18.457139 L33.7679163,24.5975045 L33.8586879,24.6558939 C34.1421402,24.869295 34.2318946,25.2618126 34.0529182,25.5760558 L34.0529182,25.5760558 L33.4156192,26.6953802 L33.3514292,26.7897715 C33.209998,26.9657333 32.9941043,27.0636982 32.7729509,27.0643583 L32.7729509,27.0643583 L32.7680827,27.0643583 L32.6779558,27.0586247 C32.5879161,27.0474223 32.4986517,27.0196623 32.4147834,26.9739863 L32.4147834,26.9739863 L21.0505002,20.787465 C17.8419796,24.7612312 12.2000855,25.9600172 7.6241877,23.3712737 L7.6241877,23.3712737 L7.36536647,23.2200882 C2.41669225,20.2366753 0.67751601,13.7722478 3.49403678,8.6316323 L3.49403678,8.6316323 L3.6601182,8.33911988 C5.64218228,4.96847593 9.16626134,3.0718225 12.799083,3.06435826 L12.799083,3.06435826 L12.8438465,3.06435826 Z M16.2912917,7.01697369 C12.6533064,5.11628805 8.1609998,6.47892128 6.15632794,10.1377985 L6.15632794,10.1377985 L6.03523038,10.3676703 C4.16471227,14.0642009 5.50564749,18.6290368 9.10644592,20.6661138 C10.2797786,21.3299278 11.5510493,21.6449951 12.8049992,21.6449951 L12.8049992,21.6449951 L13.0813329,21.6398937 C15.6569446,21.5447929 18.1224535,20.1235013 19.4676412,17.6683397 L19.4676412,17.6683397 L19.5887387,17.4384637 C21.4592569,13.7418707 20.1183216,9.17717235 16.5175232,7.1400244 L16.5175232,7.1400244 Z" id="形状结合" transform="translate(18.145302, 15.064358) rotate(12.000000) translate(-18.145302, -15.064358) "></path>
                </g>
                <g id="编组" transform="translate(13.005452, 64.000000)">
                    <polygon id="Fill-1" fill="#D8D8D8" points="3.89684224 20 4.98873743 20 4.98873743 4.18432198"></polygon>
                    <polygon id="Fill-3" fill="url(#linearGradient-8)" points="4.55418385 0 4.55418385 14.8809689 9.41176471 13.6517487"></polygon>
                    <mask id="mask-11" fill="white">
                        <use xlink:href="#path-10"></use>
                    </mask>
                    <use id="Fill-1" fill="url(#linearGradient-9)" xlink:href="#path-10"></use>
                </g>
                <g id="编组-3" transform="translate(99.005452, 72.000000)">
                    <polygon id="Fill-1" fill="#D8D8D8" points="2.89827641 15 3.71037346 15 3.71037346 3.13824148"></polygon>
                    <polygon id="Fill-3" fill="url(#linearGradient-12)" points="3.38717424 0 3.38717424 11.1607267 7 10.2388115"></polygon>
                    <mask id="mask-15" fill="white">
                        <use xlink:href="#path-14"></use>
                    </mask>
                    <use id="Fill-1" fill="url(#linearGradient-13)" xlink:href="#path-14"></use>
                </g>
                <path d="M3.70056853,3.9385425 L19.1898465,3.92795688 C20.200654,6.15910133 20.7046362,9.30361568 20.7017932,13.3614999 C20.6989501,17.4193841 21.9113078,20.9692026 24.3388662,24.0109553 L8.84958819,24.0215409 C6.42245252,20.3764282 5.21023699,16.6237155 5.2129416,12.7634029 C5.21564621,8.90309028 4.71152186,5.96147015 3.70056853,3.9385425 Z" id="矩形" fill="url(#linearGradient-16)" transform="translate(14.019717, 13.974749) rotate(-31.000000) translate(-14.019717, -13.974749) "></path>
            </g>
        </g>
    </g>
</svg>
    `
  )
}


