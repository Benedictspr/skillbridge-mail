// ----------------------------------------------------------------------
// Production-Grade HTML Email Exporter & Compiler
// Supports BOTH freeform canvas objects (CorelDRAW/Figma vector mode)
// AND section-row-column structured templates (Visual mode).
// Produces bulletproof table-based inline HTML with responsive styles,
// Outlook MSO conditional tags, Google Fonts, and merge tag parsing.
// ----------------------------------------------------------------------
import { getGoogleFontsExportHtml } from './fonts';
import { SOCIAL_PLATFORMS } from './socialIcons';

export function exportToHtml(emailData) {
  const body = emailData?.body || { bg: '#F8FAFC', width: 640, fontFamily: 'Inter, Arial, sans-serif' };

  // Check if we are exporting canvas freeform objects OR structured sections
  if (Array.isArray(emailData?.objects) && emailData.objects.length > 0) {
    return compileCanvasObjectsToHtml(emailData.objects, body, emailData?.name);
  }

  const sections = emailData?.sections || [];
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
          cmpsHtml += renderComponentHtml(cmp, body);
        });

        const colBg = col.bg ? `background-color: ${col.bg};` : '';
        const colPadding = col.padding ? `padding: ${col.padding}px;` : 'padding: 0 8px;';

        colsHtml += `
          <!--[if mso]>
          <td width="${colWidthPercent}%" valign="top" style="padding:0;">
          <![endif]-->
          <div class="mobile-stack" style="display:inline-block; width:100%; max-width:${colWidthPercent}%; vertical-align:top; ${colBg}">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="${colPadding}">
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

  return wrapInHtmlBoilerplate(sectionsHtml, body, emailData?.name);
}

// ----------------------------------------------------------------------
// FREEFORM CANVAS OBJECTS COMPILER
// Sorts canvas objects vertically into logical rows and compiles into
// responsive email-safe HTML table structure.
// ----------------------------------------------------------------------
function compileCanvasObjectsToHtml(objects, body, docName) {
  const visibleObjs = objects.filter(o => !o.hidden);
  if (visibleObjs.length === 0) {
    return wrapInHtmlBoilerplate('<div style="padding: 40px; text-align: center; color: #64748B;">Empty Canvas Document</div>', body, docName);
  }

  // Sort objects vertically by y position
  const sorted = [...visibleObjs].sort((a, b) => a.y - b.y);

  // Group objects into logical vertical rows (bucket threshold ~30px)
  const rows = [];
  sorted.forEach(obj => {
    let placed = false;
    for (const r of rows) {
      if (Math.abs(r.y - obj.y) < 32) {
        r.items.push(obj);
        placed = true;
        break;
      }
    }
    if (!placed) {
      rows.push({ y: obj.y, items: [obj] });
    }
  });

  let contentHtml = '';

  rows.forEach(r => {
    // Sort row items horizontally by x position
    r.items.sort((a, b) => a.x - b.x);

    let rowItemsHtml = '';
    r.items.forEach(obj => {
      rowItemsHtml += renderCanvasObjectHtml(obj, body);
    });

    contentHtml += `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
        <tr>
          <td align="center" style="padding: 4px 0;">
            ${rowItemsHtml}
          </td>
        </tr>
      </table>
    `;
  });

  return wrapInHtmlBoilerplate(contentHtml, body, docName);
}

function renderCanvasObjectHtml(obj, body) {
  const fontFam = obj.fontFamily ? `font-family: ${obj.fontFamily};` : (body?.fontFamily ? `font-family: ${obj.fontFamily};` : 'font-family: Inter, Arial, sans-serif;');
  const align = obj.align || 'center';

  switch (obj.type) {
    case 'text':
      return `
        <div style="padding: 6px 0; text-align: ${align}; ${fontFam}">
          <div style="display: inline-block; width: 100%; max-width: ${obj.width || 560}px; text-align: ${align}; font-size: ${obj.fontSize || 16}px; font-weight: ${obj.fontWeight || '400'}; color: ${obj.color || '#334155'}; line-height: 1.5; word-break: break-word;">
            ${(obj.text || '').replace(/\n/g, '<br/>')}
          </div>
        </div>
      `;

    case 'button':
      const btnBg = obj.fill || '#007C89';
      const btnColor = obj.color || '#FFFFFF';
      const radius = obj.radius !== undefined ? obj.radius : 8;
      return `
        <div style="padding: 12px 0; text-align: ${align}; ${fontFam}">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${obj.url || '#'}" style="height:${obj.height || 48}px;v-text-anchor:middle;width:${obj.width || 240}px;" arcsize="15%" stroke="f" fillcolor="${btnBg}">
            <w:anchorlock/>
            <center style="color:${btnColor};${fontFam}font-size:${obj.fontSize || 15}px;font-weight:bold;">${escapeHtml(obj.text || 'Click Here')}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${obj.url || '#'}" target="_blank" style="background-color: ${btnBg}; color: ${btnColor}; ${fontFam} font-size: ${obj.fontSize || 15}px; font-weight: ${obj.fontWeight || '700'}; padding: 12px 28px; text-decoration: none; border-radius: ${radius}px; display: inline-block; min-width: ${Math.min(180, obj.width || 200)}px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            ${escapeHtml(obj.text || 'Click Here')}
          </a>
          <!--<![endif]-->
        </div>
      `;

    case 'badge':
      return `
        <div style="padding: 8px 0; text-align: ${align}; ${fontFam}">
          <span style="background-color: ${obj.fill || '#1E293B'}; color: ${obj.color || '#38BDF8'}; border: ${obj.strokeWidth || 1}px solid ${obj.stroke || '#334155'}; ${fontFam} font-size: 11px; font-weight: 800; padding: 5px 14px; border-radius: 9999px; display: inline-block; letter-spacing: 1px; text-transform: uppercase;">
            ${escapeHtml(obj.text || 'BADGE')}
          </span>
        </div>
      `;

    case 'image':
      return `
        <div style="padding: 12px 0; text-align: ${align};">
          ${obj.url ? `
            ${obj.linkUrl ? `<a href="${obj.linkUrl}" target="_blank">` : ''}
            <img src="${obj.url}" alt="${escapeHtml(obj.alt || obj.name || '')}" style="width: ${obj.width || 360}px; max-width: 100%; height: auto; border-radius: ${obj.radius || 0}px; display: block; margin: 0 auto; opacity: ${obj.opacity ?? 1};" />
            ${obj.linkUrl ? `</a>` : ''}
          ` : ''}
        </div>
      `;

    case 'social':
      const iconSize = 28;
      const platforms = obj.platforms || ['telegram', 'twitter', 'linkedin', 'instagram', 'github'];
      return `
        <div style="padding: 12px 0; text-align: ${align};">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="display: inline-block;">
            <tr>
              ${platforms.map(p => {
                const plat = SOCIAL_PLATFORMS.find(sp => sp.id === p) || { label: p, color: '#334155', defaultUrl: '#' };
                const customUrl = (obj.urls && obj.urls[p]) || plat.defaultUrl || '#';

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

    case 'rectangle':
      return `
        <div style="padding: 8px 0; text-align: ${align};">
          <div style="display: inline-block; width: 100%; max-width: ${obj.width || 560}px; height: ${obj.height || 120}px; background-color: ${obj.fill || '#FFFFFF'}; border: ${obj.strokeWidth || 1}px solid ${obj.stroke || '#E2E8F0'}; border-radius: ${obj.radius || 12}px; opacity: ${obj.opacity ?? 1}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"></div>
        </div>
      `;

    case 'ellipse':
      return `
        <div style="padding: 8px 0; text-align: ${align};">
          <div style="display: inline-block; width: ${obj.width || 120}px; height: ${obj.height || 120}px; background-color: ${obj.fill || '#007C89'}; border: ${obj.strokeWidth || 1}px solid ${obj.stroke || '#0284C7'}; border-radius: 9999px; opacity: ${obj.opacity ?? 1};"></div>
        </div>
      `;

    case 'star':
      return `
        <div style="padding: 8px 0; text-align: ${align};">
          <div style="display: inline-block; width: ${obj.width || 80}px; height: ${obj.height || 80}px; background-color: ${obj.fill || '#EC4899'}; border-radius: 8px; text-align: center; line-height: ${obj.height || 80}px; color: #FFFFFF; font-size: 24px;">★</div>
        </div>
      `;

    case 'line':
    case 'arrow':
      return `
        <div style="padding: 12px 0; text-align: ${align};">
          <hr style="border: 0; border-top: ${obj.strokeWidth || 2}px ${obj.style || 'solid'} ${obj.stroke || '#007C89'}; width: ${obj.width || 300}px; max-width: 100%; margin: 0 auto;" />
        </div>
      `;

    default:
      return '';
  }
}

function wrapInHtmlBoilerplate(bodyHtml, body, docName) {
  const googleFontsHtml = getGoogleFontsExportHtml();

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escapeHtml(docName || 'SkillBridge Design Studio Email')}</title>
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
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${body.bg || '#F8FAFC'}; font-family: ${body.fontFamily || 'Inter, Arial, sans-serif'}; }
    
    @media screen and (max-width: 600px) {
      .responsive-table { width: 100% !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-stack { display: block !important; width: 100% !important; max-width: 100% !important; }
      .mobile-center { text-align: center !important; }
      .mobile-hide { display: none !important; }
      .mobile-text-lg { font-size: 20px !important; line-height: 1.3 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${body.bg || '#F8FAFC'}; word-spacing: normal;">
  <div role="article" aria-roledescription="email" lang="en" style="background-color: ${body.bg || '#F8FAFC'}; font-family: ${body.fontFamily || 'Inter, Arial, sans-serif'}; padding: 24px 0;">
    <!-- CONTAINER TABLE -->
    <!--[if mso]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="${body.width || 640}" align="center">
      <tr>
        <td width="${body.width || 640}">
    <![endif]-->
    <div style="max-width: ${body.width || 640}px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      ${bodyHtml}
    </div>
    <!--[if mso]>
        </td>
      </tr>
    </table>
    <![endif]-->
  </div>
</body>
</html>`;
}

function renderComponentHtml(cmp, body) {
  const pt = cmp.paddingTop ?? 12;
  const pb = cmp.paddingBottom ?? 12;
  const fontFam = cmp.fontFamily ? `font-family: ${cmp.fontFamily};` : (body?.fontFamily ? `font-family: ${body.fontFamily};` : '');

  switch (cmp.type) {
    case 'heading':
      return `
        <div style="padding-top: ${pt}px; padding-bottom: ${pb}px; text-align: ${cmp.align || 'left'};">
          <h1 style="margin: 0; ${fontFam} font-size: ${cmp.size || 24}px; font-weight: ${cmp.weight || '700'}; color: ${cmp.color || '#0F172A'}; line-height: 1.2; letter-spacing: ${cmp.letterSpacing || 'normal'};">
            ${cmp.text || 'Heading Title'}
          </h1>
        </div>
      `;

    case 'text':
    case 'paragraph':
    case 'rich_text':
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
          <a href="${cmp.url || '#'}" target="_blank" style="background-color: ${cmp.bg || '#007C89'}; color: ${cmp.color || '#FFFFFF'}; ${fontFam} font-size: ${cmp.size || 16}px; font-weight: bold; padding: ${cmp.paddingV || 14}px ${cmp.paddingH || 32}px; text-decoration: none; border-radius: ${cmp.borderRadius === 9999 ? '9999px' : `${cmp.borderRadius || 8}px`}; display: inline-block; box-shadow: ${cmp.shadow || 'none'};">
            ${escapeHtml(cmp.text || 'Button')}
          </a>
          <!--<![endif]-->
        </div>
      `;

    case 'badge':
      return `
        <div style="padding-top: ${pt}px; padding-bottom: ${pb}px; text-align: ${cmp.align || 'left'};">
          <span style="background-color: ${cmp.bg || '#EFF6FF'}; color: ${cmp.color || '#3B82F6'}; border: 1px solid ${cmp.border || '#BFDBFE'}; ${fontFam} font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; display: inline-block; letter-spacing: 0.5px; text-transform: uppercase;">
            ${escapeHtml(cmp.text || 'BADGE')}
          </span>
        </div>
      `;

    case 'image':
      return `
        <div style="padding-top: ${pt}px; padding-bottom: ${pb}px; text-align: ${cmp.align || 'center'};">
          ${cmp.url ? `
            ${cmp.linkUrl ? `<a href="${cmp.linkUrl}" target="_blank">` : ''}
            <img src="${cmp.url}" alt="${escapeHtml(cmp.alt || '')}" style="width: ${cmp.width || '100%'}; max-width: 100%; border-radius: ${cmp.borderRadius || 0}px; display: block; margin: 0 auto;" />
            ${cmp.linkUrl ? `</a>` : ''}
          ` : ''}
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

    case 'divider':
      return `
        <div style="padding-top: ${pt}px; padding-bottom: ${pb}px;">
          <hr style="border: 0; border-top: 1px ${cmp.style || 'solid'} ${cmp.color || '#E2E8F0'}; margin: 0;" />
        </div>
      `;

    default:
      return '';
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
