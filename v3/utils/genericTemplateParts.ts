import { t } from '../middleware/i18n';

export const aboutUs = (lang: string) => {
  return `
<div id="p1dimg1"></div>
<div id="id_2">
    <div id="id_2_1">
      <p class="p0 ft0">${t('about.title', lang)}</p>
      <p class="p8 ft3">${t('about.doing', lang)}</p>
      <p class="p3 ft1"><span class="ft1">-</span><span class="ft4">${t('about.fullWagon', lang)}</span>
      </p>
      <p class="p3 ft1"><span class="ft1">-</span><span class="ft4">${t('about.reports', lang)}</span>
      </p>
      <p class="p3 ft1"><span class="ft1">-</span><span class="ft4">${t('about.pieces', lang)}</span>
      </p>
      <p class="p9 ft2">${t('about.deadlineDelivery', lang)}</p>
      <p class="p10 ft2">${t('about.dangerous', lang)}</p>
      <p class="p11 ft1">${t('about.oversized', lang)}</p>
      <p class="p12 ft5">${t('about.anywhere', lang)}</p>
      <p class="p3 ft1"><span class="ft1">-</span><span class="ft4">${t('about.FCL', lang)}</span>
      </p>
      <p class="p3 ft1"><span class="ft1">-</span><span class="ft4">${t('about.LCL', lang)}</span>
      </p>
      <p class="p13 ft1">${t('about.insurance', lang)}</p>
      <p class="p14 ft1">${t('about.customs', lang)}</p>
    </div>
    <div id="id_2_2">
      <p class="p0 ft0">${t('about.contactUs', lang)}:</p>
      <p class="p15 ft5">${t('about.askUs', lang)}</p>
      <p class="p16 ft1">Email: qapline@qapline.com</p>
      <p class="p17 ft1">${t('phone')}: 577 601 494</p>
    </div>
  <img src="logo.png" alt="">
</div>
  `;
};

export const genericStyle = () => {
  return `
body {
    margin-top: 0px;
     margin: auto;
     width: 738px;
}
 #page_1 {
    position:absolute;
     overflow: hidden;
     border: none;
    height: 100%;
}
 #page_1 #id_1 {
    position: absolute;
     left: 32px;
     top: 43px;
}
 #page_1 #id_2 {
    border:none;
     padding: 0px;
    border:none;
    width: 738px;
     height: 100%;
}
 #page_1 #id_2 #id_2_1 {
    position: absolute;
     left: 32px;
     top: 320px;
     border:none;
    margin: 0px 0px 0px 0px;
    padding: 0px;
    border:none;
    width: 400px;
     height: 100%
}
 #page_1 #id_2 #id_2_2 {
    position: absolute;
     left: 400px;
     top: 320px;
     border:none;
    margin: 0px 0px 0px 0px;
    padding: 0px;
    border:none;
    width: 382px;
}
 #page_1 #p1dimg1 {
    position:absolute;
     top:300px;
     left:0px;
     width:100%;
     height:0px;
     border-top: dashed 2px gray
}
 img {
    position: absolute;
     bottom: 48px;
     right: 0;
     height:48px;
     width: 113px;
}
 .ft0{
    font: 18px 'Arial';
    line-height: 18px;
}
 .ft1{
    font: 12px 'Arial';
    line-height: 12px;
}
 .ft2{
    font: 12px 'Arial';
    line-height: 12px;
}
 .ft3{
    font: 12px 'Arial';
    line-height: 12px;
}
 .ft4{
    font: 12px 'Arial';
    margin-left: 5px;
    line-height: 18px;
}
 .ft5{
    font: 12px 'Arial';
    line-height: 12px;
}
 .p0{
    text-align: left;
    margin-top: 0px;
    margin-bottom: 0px;
}
 .p1{
    text-align: left;
    margin-top: 30px;
    margin-bottom: 0px;
}
 .p2{
    text-align: left;
    padding-left: 37px;
    margin-top: 19px;
    margin-bottom: 0px;
}
 .p3{
    text-align: left;
    padding-left: 37px;
    margin-top: 0px;
    margin-bottom: 0px;
}
 .p4{
    text-align: left;
    padding-left: 37px;
    margin-top: 2px;
    margin-bottom: 0px;
}
 .p5{
    text-align: left;
    padding-left: 37px;
    margin-top: 1px;
    margin-bottom: 0px;
}
 .p6{
    text-align: left;
    margin-top: 20px;
    margin-bottom: 0px;
}
 .p7{
    text-align: left;
    padding-right: 54px margin-top: 19px;
    margin-bottom: 0px;
}
 .p8{
    text-align: left;
    padding-right: 54px;
    margin-top: 17px;
    margin-bottom: 0px;
}
 .p9{
    text-align: left;
    padding-right: 40px;
    margin-top: 17px;
    margin-bottom: 0px;
}
 .p10{
    text-align: left;
    padding-right: 39px;
    margin-top: 8px;
    margin-bottom: 0px;
}
 .p11{
    text-align: left;
    margin-top: 8px;
    margin-bottom: 0px;
}
 .p12{
    text-align: left;
    padding-right: 40px;
    margin-top: 18px;
    margin-bottom: 0px;
}
 .p13{
    text-align: left;
    margin-top: 14px;
    margin-bottom: 0px;
}
 .p14{
    text-align: left;
    margin-top: 19px;
    margin-bottom: 0px;
}
 .p15{
    text-align: left;
    padding-right: 60px;
    margin-top: 20px;
    margin-bottom: 0px;
}
 .p16{
    text-align: left;
    margin-top: 7px;
    margin-bottom: 0px;
}
 .p17{
    text-align: left;
    margin-top: 3px;
    margin-bottom: 0px;
}
 .p18{
    text-align: left;
    margin-top: 3px;
    margin-bottom: 0px;
}
`;
};
