/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { GitHubRepo, GitHubSearchResult, GitHubUser } from "#/types";
import axios from "axios";
import { exec } from "child_process";
import {
	ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Message,
	ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle
} from "discord.js";
import { MxRecord, SoaRecord, SrvRecord } from "dns";
import { lookup } from "dns/promises";
import { ping } from "tcp-ping";
import { promisify } from "util";

export async function showMainMenu(message: Message, prefix: string) {
  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("DNS & Website Analysis Tool")
    .setDescription("Please select an option from the menu below to analyze a website")
    .addFields(
      { name: "Quick Lookup", value: `\`${prefix}dns [domain]\``, inline: true },
      { name: "Full Analysis", value: "Use the button below", inline: true },
      { name: "Available Checks", value: "DNS Records, Ping, Traceroute, SSL Info, HTTP Status" },
    )
    .setFooter({ text: "Powered by Node.js DNS module" });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("full_analysis").setLabel("Start Full Analysis").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("dns_examples").setLabel("Show Examples").setStyle(ButtonStyle.Secondary),
  );

  const msg = await message.reply({
    embeds: [embed],
    components: [row],
  });

  // Collector for button interactions
  const collector = msg.createMessageComponentCollector({ time: 60000 });

  collector.on("collect", async (interaction: any) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "full_analysis") {
      await interaction.showModal(
        new ModalBuilder()
          .setCustomId("dns_modal")
          .setTitle("Website Analysis")
          .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId("website_url")
                .setLabel("Enter website URL or IP")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder("example.com"),
            ),
          ),
      );
    } else if (interaction.customId === "dns_examples") {
      const examplesEmbed = new EmbedBuilder()
        .setColor("#4CAF50")
        .setTitle("DNS Lookup Examples")
        .setDescription("Here are some usage examples:")
        .addFields(
          { name: "Quick DNS Lookup", value: `\`${prefix}dns google.com\`` },
          { name: "Check All Records", value: `\`${prefix}dns records example.com\`` },
          { name: "Ping Test", value: `\`${prefix}dns ping github.com\`` },
          { name: "HTTP Status", value: `\`${prefix}dns status discord.com\`` },
        );

      await interaction.reply({ embeds: [examplesEmbed], flags: "Ephemeral" });
    }
  });

  collector.on("end", () => {
    msg.edit({ components: [] }).catch(() => {});
  });
}

// Show quick lookup results
export async function showQuickLookup(message: any, domain: string) {
  try {
    // Initial response with loading state
    const loadingEmbed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle(`Analyzing ${domain}`)
      .setDescription("Gathering information...")
      .setFooter({ text: "This may take a few seconds" });

    const msg = await message.reply({ embeds: [loadingEmbed] });

    // Perform DNS lookups in parallel
    const { resolveMx, resolveTxt, resolveCname } = await import("dns/promises");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [aRecords, mxRecords, txtRecords, _cnameRecords, _pingResult] = await Promise.all([
      lookup(domain, 4).catch(() => ({ address: "Not found" })),
      resolveMx(domain).catch(() => [] as import("dns").MxRecord[]),
      resolveTxt(domain).catch(() => []),
      resolveCname(domain).catch(() => []),
      pingDomain(domain),
    ]);

    // Build results embed
    const resultEmbed = new EmbedBuilder()
      .setColor("#4CAF50")
      .setTitle(`DNS Results for ${domain}`)
      .addFields(
        { name: "IP Address (A Record)", value: aRecords.address || "Not found", inline: true },
        {
          name: "MX Records",
          value: mxRecords.length ? mxRecords.map((r: import("dns").MxRecord) => r.exchange).join("\n") : "None",
          inline: false,
        },
        {
          name: "TXT Records",
          value: txtRecords.length
            ? txtRecords
                .map((arr: string[]) => arr.join(""))
                .join("\n")
                .slice(0, 1024)
            : "None",
          inline: false,
        },
      )
      .setFooter({
        text: `Requested by: ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      });

    // Create action buttons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`dns_full_${domain}`).setLabel("Full Analysis").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`dns_ping_${domain}`).setLabel("Detailed Ping").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`dns_records_${domain}`).setLabel("All DNS Records").setStyle(ButtonStyle.Secondary),
    );

    await msg.edit({ embeds: [resultEmbed], components: [row] });

    // Collector for button interactions
    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (interaction: any) => {
      if (!interaction.isButton()) return;

      const [action, targetDomain] = interaction.customId.split("_").slice(1);

      switch (action) {
        case "full":
          await showFullAnalysis(interaction, targetDomain);
          break;
        case "ping":
          await showDetailedPing(interaction, targetDomain);
          break;
        case "records":
          await showAllDNSRecords(interaction, targetDomain);
          break;
      }
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  } catch (error: any) {
    const errorEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("Error Analyzing Domain")
      .setDescription(`Failed to analyze ${domain}. Please check the domain and try again.`)
      .setFooter({ text: `Error: ${error.message}` });

    message.reply({ embeds: [errorEmbed] });
  }
}

// Show full analysis with select menu
export async function showFullAnalysis(interaction: any, domain: string) {
  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle(`Full Analysis Options for ${domain}`)
    .setDescription("Select the type of analysis you want to perform");

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`dns_analysis_select_${domain}`)
    .setPlaceholder("Select analysis type")
    .addOptions(
      { label: "DNS Records", value: "dns_records", description: "View all DNS records" },
      { label: "Network Ping", value: "network_ping", description: "Detailed ping statistics" },
      { label: "Traceroute", value: "traceroute", description: "View network path to server" },
      { label: "HTTP Headers", value: "http_headers", description: "View website HTTP headers" },
      { label: "SSL Certificate", value: "ssl_cert", description: "View SSL certificate details" },
    );

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.reply({
    embeds: [embed],
    components: [row],
    flags: "Ephemeral",
  });

  // Handle select menu interaction
  const collector = interaction.channel.createMessageComponentCollector({
    filter: (i: any) => i.customId === `dns_analysis_select_${domain}`,
    time: 60000,
  });

  collector.on("collect", async (menuInteraction: any) => {
    const analysisType = menuInteraction.values[0];

    switch (analysisType) {
      case "dns_records":
        await showAllDNSRecords(menuInteraction, domain);
        break;
      case "network_ping":
        await showDetailedPing(menuInteraction, domain);
        break;
      case "traceroute":
        await showTraceroute(menuInteraction, domain);
        break;
      case "http_headers":
        await showHTTPHeaders(menuInteraction, domain);
        break;
      case "ssl_cert":
        await showSSLCertificate(menuInteraction, domain);
        break;
    }
  });
}

// Show all DNS records
export async function showAllDNSRecords(interaction: any, domain: string) {
  const recordTypes = ["A", "AAAA", "MX", "TXT", "CNAME", "NS", "SOA", "SRV"];

  try {
    const loadingEmbed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle(`Fetching all DNS records for ${domain}`)
      .setDescription("This may take a moment...");

    await interaction.reply({ embeds: [loadingEmbed], flags: "Ephemeral" });

    const records: any = {};

    // Import DNS resolver functions
    const { resolve4, resolve6, resolveMx, resolveTxt, resolveCname, resolveNs, resolveSoa, resolveSrv } = await import(
      "dns/promises"
    );

    // Fetch all record types in parallel
    await Promise.all(
      recordTypes.map(async (type) => {
        try {
          let result: string[] | MxRecord[] | string[][] | SoaRecord[] | SrvRecord[];
          switch (type) {
            case "A":
              result = await resolve4(domain);
              break;
            case "AAAA":
              result = await resolve6(domain);
              break;
            case "MX":
              result = await resolveMx(domain);
              break;
            case "TXT":
              result = await resolveTxt(domain);
              break;
            case "CNAME":
              result = await resolveCname(domain);
              break;
            case "NS":
              result = await resolveNs(domain);
              break;
            case "SOA":
              result = [await resolveSoa(domain)];
              break;
            case "SRV":
              result = await resolveSrv(domain);
              break;
            default:
              result = [];
          }
          records[type] = Array.isArray(result) ? result : [result];
        } catch {
          records[type] = [];
        }
      }),
    );

    // Format results
    const fields = [];
    for (const [type, values] of Object.entries(records)) {
      if (Array.isArray(values) && values.length > 0) {
        let valueStr = "";

        if (type === "MX") {
          valueStr = (values as any[]).map((r: any) => `${r.exchange} (priority ${r.priority})`).join("\n");
        } else if (type === "SOA") {
          const soa = values[0] as any;
          valueStr = `Primary NS: ${soa.nsname}\nAdmin: ${soa.hostmaster}\nSerial: ${soa.serial}\nRefresh: ${soa.refresh}\nRetry: ${soa.retry}\nExpire: ${soa.expire}\nTTL: ${soa.minttl}`;
        } else if (type === "TXT") {
          valueStr = (values as string[][]).flat().join("\n");
        } else {
          valueStr = (values as any[]).map((r: any) => String(r.address ?? r.value ?? r)).join("\n");
        }

        fields.push({
          name: type,
          value: valueStr.slice(0, 1024) || "None",
          inline: type !== "SOA" && type !== "TXT",
        });
      }
    }

    const embed = new EmbedBuilder()
      .setColor("#4CAF50")
      .setTitle(`All DNS Records for ${domain}`)
      .addFields(fields)
      .setTimestamp()
      .setFooter({ text: `Requested by: ${interaction.user.tag}` });

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    const errorEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("Error Fetching DNS Records")
      .setDescription(`Failed to fetch DNS records for ${domain}`)
      .setFooter({ text: `Error: ${error.message}` });

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

// Show detailed ping results
export async function showDetailedPing(interaction: any, domain: string) {
  try {
    const loadingEmbed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle(`Pinging ${domain}`)
      .setDescription("Measuring network latency...");

    await interaction.reply({ embeds: [loadingEmbed], flags: "Ephemeral" });

    const result = await pingDomain(domain, 5); // 5 pings for more accurate results

    const embed = new EmbedBuilder()
      .setColor("#4CAF50")
      .setTitle(`Ping Results for ${domain}`)
      .addFields(
        { name: "IP Address", value: result.address || "Unknown", inline: true },
        { name: "Min Latency", value: `${result.min} ms`, inline: true },
        { name: "Max Latency", value: `${result.max} ms`, inline: true },
        { name: "Average Latency", value: `${result.avg} ms`, inline: true },
        { name: "Packet Loss", value: `${result.packetLoss}%`, inline: true },
        { name: "Standard Deviation", value: `${result.stddev} ms`, inline: true },
      )
      .setFooter({ text: `Based on ${result.times.length} pings` });

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    const errorEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("Ping Failed")
      .setDescription(`Could not ping ${domain}`)
      .setFooter({ text: `Error: ${error.message}` });

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

const execPromise = promisify(exec);
// Show traceroute results
export async function showTraceroute(interaction: any, domain: string) {
  try {
    const loadingEmbed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle(`Tracing route to ${domain}`)
      .setDescription("This may take up to 30 seconds...");

    await interaction.reply({ embeds: [loadingEmbed], flags: "Ephemeral" });

    // Note: This uses the system's traceroute command
    const { stdout } = await execPromise(`traceroute ${domain}`);

    const embed = new EmbedBuilder()
      .setColor("#4CAF50")
      .setTitle(`Traceroute to ${domain}`)
      .setDescription(`\`\`\`\n${stdout.slice(0, 4000)}\n\`\`\``)
      .setFooter({ text: "Results from system traceroute command" });

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    const errorEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("Traceroute Failed")
      .setDescription(`Could not trace route to ${domain}`)
      .setFooter({ text: `Error: ${error.message}` });

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

// Show HTTP headers
async function showHTTPHeaders(interaction: any, domain: string) {
  try {
    const loadingEmbed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle(`Fetching HTTP headers for ${domain}`)
      .setDescription("Connecting to server...");

    await interaction.reply({ embeds: [loadingEmbed], flags: "Ephemeral" });

    const { stdout } = await execPromise(`curl -I https://${domain}`);

    const embed = new EmbedBuilder()
      .setColor("#4CAF50")
      .setTitle(`HTTP Headers for ${domain}`)
      .setDescription(`\`\`\`\n${stdout.slice(0, 4000)}\n\`\`\``)
      .setFooter({ text: "Results from curl command" });

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    const errorEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("Failed to Fetch Headers")
      .setDescription(`Could not retrieve HTTP headers for ${domain}`)
      .setFooter({ text: `Error: ${error.message}` });

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

// Show SSL certificate info
async function showSSLCertificate(interaction: any, domain: string) {
  try {
    const loadingEmbed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle(`Fetching SSL certificate for ${domain}`)
      .setDescription("Connecting to server...");

    await interaction.reply({ embeds: [loadingEmbed], flags: "Ephemeral" });

    const { stdout } = await execPromise(
      `openssl s_client -showcerts -connect ${domain}:443 </dev/null 2>/dev/null | openssl x509 -noout -text`,
    );

    const embed = new EmbedBuilder()
      .setColor("#4CAF50")
      .setTitle(`SSL Certificate for ${domain}`)
      .setDescription(`\`\`\`\n${stdout.slice(0, 4000)}\n\`\`\``)
      .setFooter({ text: "Results from openssl command" });

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    const errorEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("Failed to Fetch SSL Certificate")
      .setDescription(`Could not retrieve SSL certificate for ${domain}`)
      .setFooter({ text: `Error: ${error.message}` });

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

// Helper function to ping a domain
interface PingResult {
  address: string;
  min: number;
  max: number;
  avg: number;
  stddev: number;
  packetLoss: number;
  times: number[];
}

async function pingDomain(domain: string, count = 3): Promise<PingResult> {
  return new Promise((resolve, reject) => {
    ping({ address: domain, attempts: count }, (err: Error, result: any) => {
      if (err) return reject(err);

      const times: number[] = result.results.filter((r: any) => typeof r.time === "number").map((r: any) => r.time as number);
      const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
      const min = times.length ? Math.min(...times) : 0;
      const max = times.length ? Math.max(...times) : 0;

      // Calculate standard deviation
      const squareDiffs = times.map((time) => Math.pow(time - avg, 2));
      const avgSquareDiff = times.length ? squareDiffs.reduce((a, b) => a + b, 0) / times.length : 0;
      const stddev = Math.sqrt(avgSquareDiff);

      // Calculate packet loss
      const packetLoss = result.results.length ? ((result.results.length - times.length) / result.results.length) * 100 : 0;

      resolve({
        address: result.results[0]?.address || domain,
        min,
        max,
        avg,
        stddev,
        packetLoss,
        times,
      });
    });
  });
}

export async function handleUser(message: Message, username: string) {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}`, {
      headers: {
        "User-Agent": "DiscordBot (https://github.com)",
      },
    });
    const userData: GitHubUser = response.data;

    // Main user embed
    const userEmbed = new EmbedBuilder()
      .setTitle(`${userData.name || userData.login} ${userData.type === "Organization" ? "🏢" : "👤"}`)
      .setURL(userData.html_url)
      .setColor(0x24292e) // GitHub dark color
      .setThumbnail(userData.avatar_url)
      .setDescription(userData.bio || "No bio provided")
      .addFields(
        { name: "Public Repos", value: userData.public_repos.toString(), inline: true },
        { name: "Followers", value: userData.followers.toString(), inline: true },
        { name: "Following", value: userData.following.toString(), inline: true },
        {
          name: "Created",
          value: new Date(userData.created_at).toLocaleDateString(),
          inline: true,
        },
        { name: "Location", value: userData.location || "Not specified", inline: true },
        { name: "Company", value: userData.company || "None", inline: true },
      );

    // Additional fields if available
    if (userData.blog) {
      userEmbed.addFields({
        name: "Website",
        value: `[${userData.blog}](${userData.blog.startsWith("http") ? userData.blog : `https://${userData.blog}`})`,
        inline: true,
      });
    }

    if (userData.twitter_username) {
      userEmbed.addFields({
        name: "Twitter",
        value: `[@${userData.twitter_username}](https://twitter.com/${userData.twitter_username})`,
        inline: true,
      });
    }

    // Get user's repositories
    const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`, {
      headers: {
        "User-Agent": "DiscordBot (https://github.com)",
      },
    });
    const repos: GitHubRepo[] = reposResponse.data;

    // Create buttons
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel("View Profile").setURL(userData.html_url).setStyle(ButtonStyle.Link),
      new ButtonBuilder().setLabel("View Repositories").setCustomId("view_repos").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setLabel("View Starred").setCustomId("view_starred").setStyle(ButtonStyle.Primary),
    );

    // Send initial message
    const msg = await message.reply({
      embeds: [userEmbed],
      components: [buttons],
    });

    // Collector for interactions
    const collector = msg.createMessageComponentCollector({
      time: 60000, // 1 minute
      componentType: ComponentType.Button,
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.isButton()) return;

      await interaction.deferUpdate();

      switch (interaction.customId) {
        case "view_repos": {
          const reposEmbed = new EmbedBuilder()
            .setTitle(`Recent Repositories by ${userData.login}`)
            .setColor(0x24292e)
            .setDescription(
              repos
                .map((repo) => {
                  const emoji = repo.fork ? "🔀" : repo.archived ? "🗄️" : "📦";
                  return `${emoji} [${repo.name}](${repo.html_url}) - ${repo.stargazers_count} ⭐ - ${repo.language || "No language"}`;
                })
                .join("\n"),
            );

          await interaction.editReply({ embeds: [userEmbed, reposEmbed] });
          break;
        }

        case "view_starred": {
          try {
            const starredResponse = await axios.get(`https://api.github.com/users/${username}/starred?per_page=5`, {
              headers: {
                "User-Agent": "DiscordBot (https://github.com)",
              },
            });
            const starredRepos: GitHubRepo[] = starredResponse.data;

            const starredEmbed = new EmbedBuilder()
              .setTitle(`Recently Starred by ${userData.login}`)
              .setColor(0x24292e)
              .setDescription(
                starredRepos
                  .map((repo) => {
                    return `⭐ [${repo.full_name}](${repo.html_url}) - ${repo.stargazers_count} stars - ${repo.language || "No language"}`;
                  })
                  .join("\n") || "No starred repositories",
              );

            await interaction.editReply({ embeds: [userEmbed, starredEmbed] });
          } catch (error) {
            console.error("Error fetching starred repos:", error);
            await interaction.editReply({ embeds: [userEmbed] });
          }
          break;
        }
      }
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(console.error);
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return message.reply(`GitHub user "${username}" not found.`);
    }
    console.error("Error fetching GitHub user:", error);
    return message.reply("An error occurred while fetching GitHub user information.");
  }

  return;
}

export async function handleRepository(message: Message, repoPath: string) {
  try {
    const [owner, repoName] = repoPath.split("/");
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: {
        "User-Agent": "DiscordBot (https://github.com)",
      },
    });
    const repoData: GitHubRepo = response.data;

    // Main repo embed
    const repoEmbed = new EmbedBuilder()
      .setTitle(`${repoData.full_name} ${repoData.archived ? "🗄️ (Archived)" : ""}`)
      .setURL(repoData.html_url)
      .setColor(0x24292e)
      .setDescription(repoData.description || "No description provided")
      .addFields(
        { name: "Stars", value: repoData.stargazers_count.toString(), inline: true },
        { name: "Forks", value: repoData.forks_count.toString(), inline: true },
        { name: "Watchers", value: repoData.watchers_count.toString(), inline: true },
        { name: "Language", value: repoData.language || "Not specified", inline: true },
        { name: "License", value: repoData.license?.name || "None", inline: true },
        { name: "Open Issues", value: repoData.open_issues_count.toString(), inline: true },
        {
          name: "Created",
          value: new Date(repoData.created_at).toLocaleDateString(),
          inline: true,
        },
        {
          name: "Last Updated",
          value: new Date(repoData.updated_at).toLocaleDateString(),
          inline: true,
        },
        { name: "Default Branch", value: repoData.default_branch, inline: true },
      );

    // Add topics if available
    if (repoData.topics && repoData.topics.length > 0) {
      repoEmbed.addFields({
        name: "Topics",
        value: repoData.topics.map((topic: string) => `\`${topic}\``).join(" "),
        inline: false,
      });
    }

    // Add homepage if available
    if (repoData.homepage) {
      repoEmbed.addFields({
        name: "Homepage",
        value: `[${repoData.homepage}](${repoData.homepage.startsWith("http") ? repoData.homepage : `https://${repoData.homepage}`})`,
        inline: false,
      });
    }

    // Create buttons
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel("View Repository").setURL(repoData.html_url).setStyle(ButtonStyle.Link),
      new ButtonBuilder().setLabel("View Owner").setCustomId("view_owner").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setLabel("View Readme").setCustomId("view_readme").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setLabel("View Languages").setCustomId("view_languages").setStyle(ButtonStyle.Secondary),
    );

    // Get branches for select menu
    const branchesResponse = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/branches`, {
      headers: {
        "User-Agent": "DiscordBot (https://github.com)",
      },
    });
    const branches = branchesResponse.data.slice(0, 25);

    const branchSelect = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("select_branch")
        .setPlaceholder("Select a branch")
        .addOptions(
          branches.map((branch: any) => ({
            label: branch.name,
            value: branch.name,
            description: `Branch ${branch.name}`,
            default: branch.name === repoData.default_branch,
          })),
        ),
    );

    // Send initial message
    const msg = await message.reply({
      embeds: [repoEmbed],
      components: [buttons, branchSelect],
    });

    // Collector for interactions
    const collector = msg.createMessageComponentCollector({
      time: 60000,
      componentType: ComponentType.Button,
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.isButton()) return;

      await interaction.deferUpdate();

      switch (interaction.customId) {
        case "view_owner": {
          return handleUser(message, repoData.owner.login);
        }

        case "view_readme": {
          try {
            const readmeResponse = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/readme`, {
              headers: {
                "User-Agent": "DiscordBot (https://github.com)",
                Accept: "application/vnd.github.v3.raw",
              },
            });
            const readmeText = readmeResponse.data;

            const readmeEmbed = new EmbedBuilder()
              .setTitle(`README for ${repoData.full_name}`)
              .setColor(0x24292e)
              .setDescription(
                readmeText.length > 2000
                  ? `${readmeText.substring(0, 2000)}...\n\n[View full README](${repoData.html_url}#readme)`
                  : readmeText,
              );

            await interaction.editReply({ embeds: [repoEmbed, readmeEmbed] });
          } catch (_error) {
            const readmeEmbed = new EmbedBuilder()
              .setTitle(`README for ${repoData.full_name}`)
              .setColor(0x24292e)
              .setDescription(`No README found or it couldn't be loaded. [View repository](${repoData.html_url})`);

            console.log(_error);
            await interaction.editReply({ embeds: [repoEmbed, readmeEmbed] });
          }
          break;
        }

        case "view_languages": {
          try {
            const languagesResponse = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/languages`, {
              headers: {
                "User-Agent": "DiscordBot (https://github.com)",
              },
            });
            const languages: Record<string, number> = languagesResponse.data;
            const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);

            const languagesEmbed = new EmbedBuilder()
              .setTitle(`Languages used in ${repoData.name}`)
              .setColor(0x24292e)
              .setDescription(
                Object.entries(languages)
                  .map(([lang, bytes]) => {
                    const percentage = ((bytes / totalBytes) * 100).toFixed(2);
                    return `\`${lang}\`: ${percentage}% (${bytes.toLocaleString()} bytes)`;
                  })
                  .join("\n"),
              );

            await interaction.editReply({ embeds: [repoEmbed, languagesEmbed] });
          } catch (error) {
            console.error("Error fetching languages:", error);
            await interaction.editReply({ embeds: [repoEmbed] });
          }
          break;
        }
      }
      return;
    });

    // Handle branch selection
    const selectCollector = msg.createMessageComponentCollector({
      time: 60000,
      componentType: ComponentType.StringSelect,
    });

    selectCollector.on("collect", async (interaction) => {
      if (!interaction.isStringSelectMenu()) return;

      await interaction.deferUpdate();

      const selectedBranch = interaction.values[0];
      const branchEmbed = new EmbedBuilder()
        .setTitle(`Branch ${selectedBranch} of ${repoData.full_name}`)
        .setColor(0x24292e)
        .setDescription(`[View branch tree](${repoData.html_url}/tree/${selectedBranch})`);

      await interaction.editReply({ embeds: [repoEmbed, branchEmbed] });
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(console.error);
    });

    selectCollector.on("end", () => {
      msg.edit({ components: [] }).catch(console.error);
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return message.reply(`GitHub repository "${repoPath}" not found.`);
    }
    console.error("Error fetching GitHub repository:", error);
    return message.reply("An error occurred while fetching GitHub repository information.");
  }

  return;
}

export async function handleSearch(message: Message, query: string) {
  try {
    const response = await axios.get(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`,
      {
        headers: {
          "User-Agent": "DiscordBot (https://github.com)",
        },
      },
    );
    const searchData: GitHubSearchResult = response.data;

    if (searchData.total_count === 0) {
      return message.reply(`No repositories found for query "${query}"`);
    }

    const searchEmbed = new EmbedBuilder()
      .setTitle(`GitHub Search: "${query}"`)
      .setColor(0x24292e)
      .setDescription(`Found ${searchData.total_count} repositories. Showing top ${searchData.items.length} results.`)
      .addFields(
        searchData.items.map((item: any) => ({
          name: item.full_name,
          value: `${item.description || "No description"}\n⭐ ${item.stargazers_count} | 🍴 ${item.forks_count} | ${item.language || "No language"}\n[View Repository](${item.html_url})`,
          inline: false,
        })),
      );

    // Create select menu with search results
    const searchSelect = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("select_repo")
        .setPlaceholder("Select a repository for more details")
        .addOptions(
          searchData.items.map((item: any) => ({
            label: item.full_name,
            value: item.full_name,
            description: `${item.stargazers_count} stars | ${item.language || "No language"}`,
          })),
        ),
    );

    const msg = await message.reply({
      embeds: [searchEmbed],
      components: [searchSelect],
    });

    // Handle repository selection
    const collector = msg.createMessageComponentCollector({
      time: 60000,
      componentType: ComponentType.StringSelect,
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.isStringSelectMenu()) return;

      await interaction.deferUpdate();
      const selectedRepo = interaction.values[0];
      return handleRepository(message, selectedRepo);
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(console.error);
    });
  } catch (error) {
    console.error("Error searching GitHub:", error);
    return message.reply("An error occurred while searching GitHub.");
  }

  return;
}