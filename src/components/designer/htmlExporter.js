// ----------------------------------------------------------------------
// Production-Grade HTML Email Exporter & Compiler
// Produces bulletproof table-based inline HTML with responsive styles
// ----------------------------------------------------------------------
import { getGoogleFontsExportHtml } from './fonts';
import { SOCIAL_PLATFORMS } from './socialIcons';

export function exportToHtml(emailData) {
  const body = emailData.body || { bg: '#F8FAFC', width: 640, fontFamily: 'Inter, Arial, sans-serif' };
  const sections = emailData.sections || [];

  let sectionsHtml = '';

  sections.forEach((sec) => {
    const secBg = sec.bg || 'transparent';
    const paddingTop = sec.paddingTop ?? 32;
    const paddingBottom = sec.paddingBottom ?? 32;
    const paddingLeft = sec.paddingLeft ?? 24;
    const paddingRight = sec.paddingRight ?? 24;

    let rowsHtml = '';

    (sec.rows || []).forEach((row) => {
      let colsHtml = '';
      const cols = row.columns || [];
      const colWidthPercent = cols.length > 0 ? (100 / cols.length).toFixed(2) : 100;

      cols.forEach((col) => {
        let cmpsHtml = '';
        (col.components || []).forEach((cmp) => {
          cmpsHtml += renderComponentHtml(cmp);
        });

        colsHtml += `
          <!--[if mso]>
          <td width="${colWidthPercent}%" valign="top" style="padding:0;">
          <![endif]-->
          <div style="display:inline-block; width:100%; max-width:${colWidthPercent}%; vertical-align:top;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding:0 8px;">
                  ${cmpsHtml}
                </td>
              </tr>
            </table>
          </div>
          <!--[if mso]>
          </td>
          <![endif]-->
        `;
      });

      rowsHtml += `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 4px 0;">
              <!--[if mso]>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
              <![endif]-->
              ${colsHtml}
              <!--[if mso]>
                </tr>
              </table>
              <![endif]-->
            </td>
          </tr>
        </table>
      `;
    });

    sectionsHtml += `
      <!-- SECTION START -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${secBg};">
        <tr>
          <td align="center" style="padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px;">
            <!--[if mso]>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="${body.width}">
              <tr>
                <td width="${body.width}">
            <![endif]-->
            <div style="max-width: ${body.width}px; margin: 0 auto;">
              ${rowsHtml}
            </div>
            <!--[if mso]>
                </td>
              </tr>
            </table>
            <![endif]-->
          </td>
        </tr>
      </table>
      <!-- SECTION END -->
    `;
  });

  const googleFontsHtml = getGoogleFontsExportHtml();

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>SkillBridge Mail Template</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${googleFontsHtml}
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${body.bg}; font-family: ${body.fontFamily || 'sans-serif'}; }
    
    @media screen and (max-width: 600px) {
      .responsive-table { width: 100% !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${body.bg}; word-spacing: normal;">
  <div role="article" aria-roledescription="email" lang="en" style="background-color: ${body.bg};">
    ${sectionsHtml}
  </div>
</body>
</html>`;
}

function renderComponentHtml(cmp) {
  const pt = cmp.paddingTop ?? 12;
  const pb = cmp.paddingBottom ?? 12;
  const fontFam = cmp.fontFamily ? `font-family: ${cmp.fontFamily};` : '';

  switch (cmp.type) {
    case 'heading':
      return `
        <div style="padding-top: ${pt}px; padding-bottom: ${pb}px; text-align: ${cmp.align || 'left'};">
          <h1 style="margin: 0; ${fontFam} font-size: ${cmp.size || 24}px; font-weight: ${cmp.weight || '700'}; color: ${cmp.color || '#0F172A'}; line-height: 1.2; letter-spacing: ${cmp.letterSpacing || 'normal'};">
            ${escapeHtml(cmp.text || '')}
          </h1>
        </div>
      `;

    case 'text':
    case 'paragraph':
      return `
        <div style="padding-top: ${pt}px; padding-bottom: ${pb}px; text-align: ${cmp.align || 'left'}; ${fontFam} font-size: ${cmp.size || 16}px; color: ${cmp.color || '#334155'}; line-height: ${cmp.lineHeight || '1.6'};">
          ${(cmp.content || cmp.text || '').replace(/\n/g, '<br/>')}
        </div>
      `;

    case 'button':
      return `
        <div style="padding-top: ${pt}px; padding-bottom: ${pb}px; text-align: ${cmp.align || 'center'};">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${cmp.url || '#'}" style="height:${(cmp.paddingV || 14) * 2 + 20}px;v-text-anchor:middle;width:220px;" arcsize="15%" stroke="f" fillcolor="${cmp.bg || '#007C89'}">
            <w:anchorlock/>
            <center style="color:${cmp.color || '#FFFFFF'};${fontFam}font-size:16px;font-weight:bold;">${escapeHtml(cmp.text || 'Button')}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${cmp.url || '#'}" target="_blank" style="background-color: ${cmp.bg || '#007C89'}; color: ${cmp.color || '#FFFFFF'}; ${fontFam} font-size: 16px; font-weight: bold; padding: ${cmp.paddingV || 14}px ${cmp.paddingH || 32}px; text-decoration: none; border-radius: ${cmp.borderRadius || 8}px; display: inline-block; box-shadow: ${cmp.shadow || 'none'};">
            ${escapeHtml(cmp.text || 'Button')}
          </a>
          <!--<![endif]-->
        </div>
      `;

    case 'badge':
      return `
        <div style="padding-top: ${pt}px; padding-bottom: ${pb}px; text-align: ${cmp.align || 'left'};">
          <span style="background-color: ${cmp.bg || '#EFF6FF'}; color: ${cmp.color || '#3B82F6'}; border: 1px solid ${cmp.border || '#BFDBFE'}; ${fontFam} font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; display: inline-block; letter-spacing: 0.5px;">
            ${escapeHtml(cmp.text || '')}
          </span>
        </div>
      `;

    case 'image':
      return `
        <div style="padding-top: ${pt}px; padding-bottom: ${pb}px; text-align: ${cmp.align || 'center'};">
          ${cmp.url ? `<img src="${cmp.url}" alt="${escapeHtml(cmp.alt || '')}" style="width: ${cmp.width || '100%'}; max-width: 100%; border-radius: ${cmp.borderRadius || 0}px; display: block; margin: 0 auto;" />` : ''}
        </div>
      `;

    case 'divider':
      return `
        <div style="padding-top: ${pt}px; padding-bottom: ${pb}px;">
          <hr style="border: 0; border-top: 1px ${cmp.style || 'solid'} ${cmp.color || '#E2E8F0'}; margin: 0;" />
        </div>
      `;

    case 'spacer':
      return `<div style="height: ${cmp.height || 24}px; line-height: ${cmp.height || 24}px; font-size: 1px;">&nbsp;</div>`;

    case 'callout':
      return `
        <div style="padding-top: ${pt}px; padding-bottom: ${pb}px;">
          <div style="background-color: ${cmp.bg || '#F8FAFC'}; border-left: 4px solid ${cmp.border || '#007C89'}; padding: 16px 20px; border-radius: 6px; color: ${cmp.color || '#0F172A'}; font-family: sans-serif;">
            ${cmp.title ? `<strong style="font-size: 16px; display: block; margin-bottom: 6px;">${escapeHtml(cmp.title)}</strong>` : ''}
            <div style="font-size: 14px; line-height: 1.6;">${(cmp.content || '').replace(/\n/g, '<br/>')}</div>
          </div>
        </div>
      `;

    case 'countdown':
      return `
        <div style="padding-top: ${pt}px; padding-bottom: ${pb}px; text-align: ${cmp.align || 'center'}; background-color: ${cmp.bg || '#1E2937'}; padding: 20px; border-radius: 8px;">
          <div style="color: ${cmp.color || '#FFFFFF'}; font-family: sans-serif; font-size: 12px; font-weight: bold; letter-spacing: 1px; margin-bottom: 8px;">${escapeHtml(cmp.label || 'OFFER EXPIRES IN:')}</div>
          <div style="font-family: monospace; font-size: 28px; font-weight: 900; color: #FACC15; letter-spacing: 2px;">
            02d : 14h : 36m : 42s
          </div>
        </div>
      `;

    case 'video':
      return `
        <div style="padding-top: ${pt}px; padding-bottom: ${pb}px; text-align: ${cmp.align || 'center'};">
          <a href="${cmp.videoUrl || '#'}" target="_blank" style="display: inline-block; position: relative; text-decoration: none;">
            <img src="${cmp.url || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80'}" alt="Watch Video" style="width: 100%; max-width: 540px; border-radius: 8px; display: block;" />
          </a>
        </div>
      `;

    case 'social':
      const iconSize = cmp.iconSize || 24;
      return `
        <div style="padding-top: ${pt}px; padding-bottom: ${pb}px; text-align: ${cmp.align || 'center'};">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="display: inline-block;">
            <tr>
              ${(cmp.platforms || ['telegram', 'twitter', 'linkedin', 'instagram', 'github']).map(p => {
                const plat = SOCIAL_PLATFORMS.find(sp => sp.id === p) || { label: p, color: '#334155', defaultUrl: '#' };
                const customUrl = (cmp.urls && cmp.urls[p]) || plat.defaultUrl || '#';

                return `
                  <td style="padding: 0 6px;">
                    <a href="${customUrl}" target="_blank" style="background-color: ${plat.color}; color: #FFFFFF; width: ${iconSize + 12}px; height: ${iconSize + 12}px; line-height: ${iconSize + 12}px; border-radius: 9999px; text-decoration: none; font-family: sans-serif; font-size: 11px; font-weight: bold; display: inline-block; text-align: center;">
                      ${p.substring(0, 2).toUpperCase()}
                    </a>
                  </td>
                `;
              }).join('')}
            </tr>
          </table>
        </div>
      `;

    case 'footer':
      return `
        <div style="padding-top: ${pt}px; padding-bottom: ${pb}px; text-align: ${cmp.align || 'center'}; ${fontFam} font-size: ${cmp.size || 12}px; color: ${cmp.color || '#94A3B8'}; line-height: 1.5;">
          ${escapeHtml(cmp.text || 'Unsubscribe')}
        </div>
      `;

    default:
      return '';
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
