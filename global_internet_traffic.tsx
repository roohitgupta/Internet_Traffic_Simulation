
"use client";

import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
} from "react";
import * as THREE from "three";
import earcut from "earcut";

// Import React Icons
import {
    FaGlobeAmericas,
    FaGlobeAsia,
    FaGlobeEurope,
    FaGlobeAfrica,
} from "react-icons/fa";
import { BiWorld, BiNetworkChart } from "react-icons/bi";
import {
    MdOutlineRouter,
    MdSpeed,
    MdPeople,
    MdLocationOn,
} from "react-icons/md";
import { BsBuilding, BsArrowsMove } from "react-icons/bs";
import { TbWorldLatitude } from "react-icons/tb";
import { IoStatsChart } from "react-icons/io5";
import { RiDashboardLine } from "react-icons/ri";
import { AiOutlineWarning } from "react-icons/ai";

// Enhanced interfaces
interface TrafficPoint {
    id: string;
    name: string;
    lat: number;
    lng: number;
    continent: string;
    country: string;
    city: string;
    tier: "mega" | "major" | "medium" | "small";
    traffic: number;
    connections: number;
    latency: number;
    bandwidth: number;
    packetLoss: string;
    status: "online" | "degraded" | "offline";
    uptime: string;
    coordinates: { x: number; y: number; z: number };
    description: string;
    established: string;
    provider: string;
    peersConnected: number;
    ipv4Prefixes: number;
    ipv6Prefixes: number;
    threatLevel: "low" | "medium" | "high";
    dailyTraffic: number;
}

interface DataPacket {
    mesh: THREE.Mesh;
    curve: THREE.CatmullRomCurve3;
    progress: number;
    speed: number;
    color: string;
    size: number;
}

interface ContinentInfo {
    name: string;
    color: string;
    points: number;
    totalTraffic: number;
    avgLatency: number;
    uptime: number;
}

interface CountryInfo {
    name: string;
    continent: string;
    points: number;
    totalTraffic: number;
    avgLatency: number;
    uptime: number;
}

interface GlobalStats {
    totalHubs: number;
    onlineHubs: number;
    totalTraffic: number;
    averageLatency: number;
    totalConnections: number;
    dataTransferred: number;
    globalUptime: number;
    threatDetections: number;
}

// Data Generation with enhanced country information
const generateTrafficData = (): TrafficPoint[] => {
    const locations = [
        // North America - Major Hubs
        {
            id: "nyc-equinix",
            name: "Equinix New York",
            lat: 40.7128,
            lng: -74.006,
            continent: "North America",
            country: "United States",
            city: "New York",
            tier: "mega" as const,
            traffic: 4850000,
            description: "Primary East Coast internet gateway serving Wall Street and major financial institutions",
            established: "1996",
            provider: "Equinix",
            peersConnected: 950,
            ipv4Prefixes: 145000,
            ipv6Prefixes: 32000,
        },
        {
            id: "lax-one-wilshire",
            name: "One Wilshire Los Angeles",
            lat: 34.0522,
            lng: -118.2437,
            continent: "North America",
            country: "United States",
            city: "Los Angeles",
            tier: "mega" as const,
            traffic: 3950000,
            description: "Critical Pacific connectivity hub linking Americas to Asia-Pacific",
            established: "1998",
            provider: "CoreSite",
            peersConnected: 820,
            ipv4Prefixes: 118000,
            ipv6Prefixes: 28000,
        },
        {
            id: "chi-equinix",
            name: "Equinix Chicago",
            lat: 41.8781,
            lng: -87.6298,
            continent: "North America",
            country: "United States",
            city: "Chicago",
            tier: "major" as const,
            traffic: 2850000,
            description: "Central US hub connecting East and West Coast traffic",
            established: "2001",
            provider: "Equinix",
            peersConnected: 650,
            ipv4Prefixes: 95000,
            ipv6Prefixes: 21000,
        },
        {
            id: "tor-torix",
            name: "TorIX Toronto",
            lat: 43.6532,
            lng: -79.3832,
            continent: "North America",
            country: "Canada",
            city: "Toronto",
            tier: "major" as const,
            traffic: 2150000,
            description: "Canada's largest internet exchange serving millions",
            established: "2002",
            provider: "TorIX",
            peersConnected: 420,
            ipv4Prefixes: 68000,
            ipv6Prefixes: 15000,
        },
        
        // Europe - Major Hubs
        {
            id: "fra-decix",
            name: "DE-CIX Frankfurt",
            lat: 50.1109,
            lng: 8.6821,
            continent: "Europe",
            country: "Germany",
            city: "Frankfurt",
            tier: "mega" as const,
            traffic: 6250000,
            description: "World's largest internet exchange by peak traffic volume",
            established: "1995",
            provider: "DE-CIX",
            peersConnected: 1150,
            ipv4Prefixes: 250000,
            ipv6Prefixes: 65000,
        },
        {
            id: "lon-linx",
            name: "LINX London",
            lat: 51.5074,
            lng: -0.1278,
            continent: "Europe",
            country: "United Kingdom",
            city: "London",
            tier: "mega" as const,
            traffic: 5890000,
            description: "Europe's financial capital internet hub with global reach",
            established: "1994",
            provider: "LINX",
            peersConnected: 1050,
            ipv4Prefixes: 210000,
            ipv6Prefixes: 55000,
        },
        {
            id: "ams-amsix",
            name: "AMS-IX Amsterdam",
            lat: 52.3676,
            lng: 4.9041,
            continent: "Europe",
            country: "Netherlands",
            city: "Amsterdam",
            tier: "mega" as const,
            traffic: 5250000,
            description: "Major European internet hub with extensive global connectivity",
            established: "1997",
            provider: "AMS-IX",
            peersConnected: 980,
            ipv4Prefixes: 185000,
            ipv6Prefixes: 42000,
        },
        {
            id: "par-franceix",
            name: "France-IX Paris",
            lat: 48.8566,
            lng: 2.3522,
            continent: "Europe",
            country: "France",
            city: "Paris",
            tier: "major" as const,
            traffic: 3150000,
            description: "France's primary internet infrastructure hub",
            established: "2000",
            provider: "France-IX",
            peersConnected: 580,
            ipv4Prefixes: 85000,
            ipv6Prefixes: 19000,
        },
        {
            id: "mil-mix",
            name: "MIX Milan",
            lat: 45.4642,
            lng: 9.19,
            continent: "Europe",
            country: "Italy",
            city: "Milan",
            tier: "major" as const,
            traffic: 2850000,
            description: "Southern European connectivity hub",
            established: "2002",
            provider: "MIX",
            peersConnected: 450,
            ipv4Prefixes: 72000,
            ipv6Prefixes: 16000,
        },
        {
            id: "mad-espanix",
            name: "ESPANIX Madrid",
            lat: 40.4168,
            lng: -3.7038,
            continent: "Europe",
            country: "Spain",
            city: "Madrid",
            tier: "medium" as const,
            traffic: 1950000,
            description: "Iberian Peninsula's main internet gateway",
            established: "2004",
            provider: "ESPANIX",
            peersConnected: 320,
            ipv4Prefixes: 52000,
            ipv6Prefixes: 11000,
        },
        {
            id: "sto-netnod",
            name: "Netnod Stockholm",
            lat: 59.3293,
            lng: 18.0686,
            continent: "Europe",
            country: "Sweden",
            city: "Stockholm",
            tier: "medium" as const,
            traffic: 1650000,
            description: "Nordic region's primary internet exchange",
            established: "2003",
            provider: "Netnod",
            peersConnected: 280,
            ipv4Prefixes: 42000,
            ipv6Prefixes: 9000,
        },
        {
            id: "mos-msk-ix",
            name: "MSK-IX Moscow",
            lat: 55.7558,
            lng: 37.6173,
            continent: "Europe",
            country: "Russia",
            city: "Moscow",
            tier: "major" as const,
            traffic: 2750000,
            description: "Russia's largest internet exchange hub",
            established: "2000",
            provider: "MSK-IX",
            peersConnected: 480,
            ipv4Prefixes: 75000,
            ipv6Prefixes: 16000,
        },

        // Asia-Pacific - Major Hubs
        {
            id: "nrt-jpnap",
            name: "JPNAP Tokyo",
            lat: 35.6762,
            lng: 139.6503,
            continent: "Asia",
            country: "Japan",
            city: "Tokyo",
            tier: "mega" as const,
            traffic: 4950000,
            description: "Asia-Pacific's premier internet exchange and technology hub",
            established: "1993",
            provider: "JPNAP",
            peersConnected: 850,
            ipv4Prefixes: 165000,
            ipv6Prefixes: 40000,
        },
        {
            id: "sin-sgix",
            name: "SGIX Singapore",
            lat: 1.3521,
            lng: 103.8198,
            continent: "Asia",
            country: "Singapore",
            city: "Singapore",
            tier: "mega" as const,
            traffic: 4450000,
            description: "Strategic Southeast Asian hub and submarine cable landing point",
            established: "1999",
            provider: "SGIX",
            peersConnected: 750,
            ipv4Prefixes: 135000,
            ipv6Prefixes: 32000,
        },
        {
            id: "hkg-hkix",
            name: "HKIX Hong Kong",
            lat: 22.3193,
            lng: 114.1694,
            continent: "Asia",
            country: "Hong Kong",
            city: "Hong Kong",
            tier: "major" as const,
            traffic: 3750000,
            description: "Gateway between mainland China and international networks",
            established: "1995",
            provider: "HKIX",
            peersConnected: 620,
            ipv4Prefixes: 115000,
            ipv6Prefixes: 25000,
        },
        {
            id: "icn-kinx",
            name: "KINX Seoul",
            lat: 37.5665,
            lng: 126.978,
            continent: "Asia",
            country: "South Korea",
            city: "Seoul",
            tier: "major" as const,
            traffic: 3250000,
            description: "South Korea's primary internet infrastructure hub",
            established: "1998",
            provider: "KINX",
            peersConnected: 520,
            ipv4Prefixes: 95000,
            ipv6Prefixes: 20000,
        },
        {
            id: "bom-nixi",
            name: "NIXI Mumbai",
            lat: 19.076,
            lng: 72.8777,
            continent: "Asia",
            country: "India",
            city: "Mumbai",
            tier: "major" as const,
            traffic: 2850000,
            description: "India's largest internet exchange serving South Asia",
            established: "2001",
            provider: "NIXI",
            peersConnected: 450,
            ipv4Prefixes: 82000,
            ipv6Prefixes: 18000,
        },
        {
            id: "del-nixi",
            name: "NIXI Delhi",
            lat: 28.7041,
            lng: 77.1025,
            continent: "Asia",
            country: "India",
            city: "Delhi",
            tier: "medium" as const,
            traffic: 1950000,
            description: "Northern India's major internet gateway",
            established: "2003",
            provider: "NIXI",
            peersConnected: 380,
            ipv4Prefixes: 65000,
            ipv6Prefixes: 14000,
        },
        {
            id: "dxb-aeix",
            name: "AE-IX Dubai",
            lat: 25.2048,
            lng: 55.2708,
            continent: "Asia",
            country: "UAE",
            city: "Dubai",
            tier: "medium" as const,
            traffic: 1750000,
            description: "Middle East's premier internet hub connecting three continents",
            established: "2007",
            provider: "AE-IX",
            peersConnected: 350,
            ipv4Prefixes: 58000,
            ipv6Prefixes: 13000,
        },
        {
            id: "bkk-thix",
            name: "ThIX Bangkok",
            lat: 13.7563,
            lng: 100.5018,
            continent: "Asia",
            country: "Thailand",
            city: "Bangkok",
            tier: "medium" as const,
            traffic: 1450000,
            description: "Southeast Asia's important connectivity hub",
            established: "2005",
            provider: "ThIX",
            peersConnected: 280,
            ipv4Prefixes: 45000,
            ipv6Prefixes: 10000,
        },
        {
            id: "bej-bjix",
            name: "BJIX Beijing",
            lat: 39.9042,
            lng: 116.4074,
            continent: "Asia",
            country: "China",
            city: "Beijing",
            tier: "major" as const,
            traffic: 3850000,
            description: "China's capital internet infrastructure hub",
            established: "2000",
            provider: "BJIX",
            peersConnected: 580,
            ipv4Prefixes: 95000,
            ipv6Prefixes: 21000,
        },

        // South America
        {
            id: "gru-pttbr",
            name: "PTT.br São Paulo",
            lat: -23.5505,
            lng: -46.6333,
            continent: "South America",
            country: "Brazil",
            city: "São Paulo",
            tier: "major" as const,
            traffic: 2450000,
            description: "South America's primary internet infrastructure hub",
            established: "2004",
            provider: "PTT.br",
            peersConnected: 520,
            ipv4Prefixes: 75000,
            ipv6Prefixes: 16000,
        },
        {
            id: "bog-calix",
            name: "CALIX Bogotá",
            lat: 4.711,
            lng: -74.0721,
            continent: "South America",
            country: "Colombia",
            city: "Bogotá",
            tier: "medium" as const,
            traffic: 1450000,
            description: "Northern South America's internet gateway",
            established: "2008",
            provider: "CALIX",
            peersConnected: 220,
            ipv4Prefixes: 38000,
            ipv6Prefixes: 8000,
        },
        {
            id: "bue-cabase",
            name: "CABASE Buenos Aires",
            lat: -34.6118,
            lng: -58.3960,
            continent: "South America",
            country: "Argentina",
            city: "Buenos Aires",
            tier: "medium" as const,
            traffic: 1250000,
            description: "Argentina's main internet exchange",
            established: "2006",
            provider: "CABASE",
            peersConnected: 180,
            ipv4Prefixes: 32000,
            ipv6Prefixes: 7000,
        },

        // Africa
        {
            id: "cpt-napafrica",
            name: "NAPAfrica Cape Town",
            lat: -33.9249,
            lng: 18.4241,
            continent: "Africa",
            country: "South Africa",
            city: "Cape Town",
            tier: "medium" as const,
            traffic: 950000,
            description: "Africa's gateway to international connectivity via submarine cables",
            established: "2006",
            provider: "NAPAfrica",
            peersConnected: 220,
            ipv4Prefixes: 35000,
            ipv6Prefixes: 7000,
        },
        {
            id: "jnb-jinx",
            name: "JINX Johannesburg",
            lat: -26.2041,
            lng: 28.0473,
            continent: "Africa",
            country: "South Africa",
            city: "Johannesburg",
            tier: "medium" as const,
            traffic: 850000,
            description: "South Africa's economic hub internet exchange",
            established: "2007",
            provider: "JINX",
            peersConnected: 180,
            ipv4Prefixes: 28000,
            ipv6Prefixes: 6000,
        },
        {
            id: "cai-egix",
            name: "EGIX Cairo",
            lat: 30.0444,
            lng: 31.2357,
            continent: "Africa",
            country: "Egypt",
            city: "Cairo",
            tier: "medium" as const,
            traffic: 750000,
            description: "North Africa's major internet gateway",
            established: "2008",
            provider: "EGIX",
            peersConnected: 150,
            ipv4Prefixes: 25000,
            ipv6Prefixes: 5000,
        },
        {
            id: "lag-ixpn",
            name: "IXPN Lagos",
            lat: 6.5244,
            lng: 3.3792,
            continent: "Africa",
            country: "Nigeria",
            city: "Lagos",
            tier: "medium" as const,
            traffic: 650000,
            description: "West Africa's largest internet exchange",
            established: "2009",
            provider: "IXPN",
            peersConnected: 120,
            ipv4Prefixes: 22000,
            ipv6Prefixes: 4000,
        },

        // Oceania
        {
            id: "syd-ixaustralia",
            name: "IX Australia Sydney",
            lat: -33.8688,
            lng: 151.2093,
            continent: "Oceania",
            country: "Australia",
            city: "Sydney",
            tier: "major" as const,
            traffic: 2150000,
            description: "Australia's premier internet exchange with Asia-Pacific focus",
            established: "2000",
            provider: "IX Australia",
            peersConnected: 420,
            ipv4Prefixes: 62000,
            ipv6Prefixes: 14000,
        },
        {
            id: "mel-ixaustralia",
            name: "IX Australia Melbourne",
            lat: -37.8136,
            lng: 144.9631,
            continent: "Oceania",
            country: "Australia",
            city: "Melbourne",
            tier: "medium" as const,
            traffic: 1550000,
            description: "Southern Australia's main internet hub",
            established: "2003",
            provider: "IX Australia",
            peersConnected: 280,
            ipv4Prefixes: 45000,
            ipv6Prefixes: 10000,
        },
        {
            id: "akl-nzix",
            name: "NZIX Auckland",
            lat: -36.8485,
            lng: 174.7633,
            continent: "Oceania",
            country: "New Zealand",
            city: "Auckland",
            tier: "small" as const,
            traffic: 450000,
            description: "New Zealand's primary internet exchange",
            established: "2005",
            provider: "NZIX",
            peersConnected: 80,
            ipv4Prefixes: 15000,
            ipv6Prefixes: 3000,
        },
    ];

    return locations.map((location) => ({
        ...location,
        connections: Math.floor(Math.random() * 2500 + 800),
        latency: Math.floor(Math.random() * 100 + 5),
        bandwidth: Math.floor(location.traffic * (0.7 + Math.random() * 0.6)),
        packetLoss: (Math.random() * 0.6).toFixed(3),
        status:
            Math.random() > 0.04
                ? "online"
                : ((Math.random() > 0.8 ? "degraded" : "offline") as
                    | "online"
                    | "degraded"
                    | "offline"),
        uptime: (99.1 + Math.random() * 0.9).toFixed(2),
        coordinates: { x: 0, y: 0, z: 0 },
        threatLevel:
            Math.random() > 0.8
                ? "high"
                : ((Math.random() > 0.6 ? "medium" : "low") as
                    | "low"
                    | "medium"
                    | "high"),
        dailyTraffic: Math.floor(
            location.traffic * 24 * (0.8 + Math.random() * 0.4)
        ),
    }));
};

// Realistic World GeoJSON Data
const realisticWorldGeoJson = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            properties: { name: "North America" },
            geometry: {
                type: "MultiPolygon",
                coordinates: [
                    // Main North America landmass
                    [[
                        [-168.0, 65.5], [-164.0, 68.7], [-160.0, 70.0], [-156.0, 71.0],
                        [-140.0, 69.6], [-128.0, 69.8], [-110.0, 73.0], [-95.0, 73.2],
                        [-81.0, 73.5], [-68.0, 82.0], [-45.0, 83.0], [-30.0, 83.5],
                        [-10.0, 82.0], [10.0, 78.0], [25.0, 76.0], [40.0, 72.0],
                        [55.0, 68.0], [65.0, 62.0], [70.0, 55.0], [72.0, 48.0],
                        [70.0, 42.0], [65.0, 38.0], [58.0, 35.0], [50.0, 33.0],
                        [42.0, 32.0], [35.0, 31.0], [28.0, 30.5], [20.0, 30.0],
                        [12.0, 29.5], [5.0, 29.0], [-2.0, 28.5], [-8.0, 28.0],
                        [-14.0, 27.5], [-20.0, 27.0], [-26.0, 26.5], [-32.0, 26.0],
                        [-38.0, 25.5], [-44.0, 25.0], [-50.0, 24.5], [-56.0, 24.0],
                        [-62.0, 23.5], [-68.0, 23.0], [-74.0, 22.5], [-80.0, 22.0],
                        [-86.0, 21.5], [-92.0, 21.0], [-98.0, 20.5], [-104.0, 20.0],
                        [-110.0, 19.5], [-116.0, 19.0], [-122.0, 18.5], [-128.0, 18.0],
                        [-134.0, 17.5], [-140.0, 17.0], [-146.0, 16.5], [-152.0, 16.0],
                        [-158.0, 15.5], [-164.0, 15.0], [-170.0, 14.5], [-175.0, 14.0],
                        [180.0, 13.5], [175.0, 13.0], [170.0, 12.5], [165.0, 12.0],
                        [160.0, 11.5], [155.0, 11.0], [150.0, 25.0], [145.0, 40.0],
                        [140.0, 50.0], [130.0, 58.0], [120.0, 62.0], [100.0, 65.0],
                        [80.0, 67.0], [60.0, 68.5], [40.0, 69.0], [20.0, 69.2],
                        [0.0, 69.0], [-20.0, 68.5], [-40.0, 67.5], [-60.0, 66.0],
                        [-80.0, 64.0], [-100.0, 61.5], [-120.0, 58.5], [-140.0, 55.0],
                        [-160.0, 51.0], [-168.0, 65.5]
                    ]],
                    // Greenland
                    [[
                        [-45.0, 83.5], [-42.0, 83.0], [-35.0, 82.0], [-30.0, 80.0],
                        [-25.0, 77.0], [-22.0, 74.0], [-20.0, 70.0], [-22.0, 66.0],
                        [-25.0, 63.0], [-30.0, 61.0], [-35.0, 60.0], [-40.0, 60.5],
                        [-45.0, 62.0], [-50.0, 64.0], [-52.0, 67.0], [-52.0, 70.0],
                        [-50.0, 73.0], [-47.0, 76.0], [-45.0, 79.0], [-44.0, 82.0],
                        [-45.0, 83.5]
                    ]]
                ]
            }
        },
        {
            type: "Feature",
            properties: { name: "South America" },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [-81.0, 12.0], [-78.0, 8.0], [-75.0, 4.0], [-72.0, 0.0],
                    [-70.0, -4.0], [-68.0, -8.0], [-66.0, -12.0], [-64.0, -16.0],
                    [-62.0, -20.0], [-60.0, -24.0], [-58.0, -28.0], [-56.0, -32.0],
                    [-54.0, -36.0], [-52.0, -40.0], [-50.0, -44.0], [-48.0, -48.0],
                    [-46.0, -52.0], [-44.0, -54.0], [-40.0, -55.0], [-36.0, -54.5],
                    [-32.0, -53.0], [-28.0, -50.0], [-26.0, -46.0], [-25.0, -42.0],
                    [-24.0, -38.0], [-23.0, -34.0], [-22.0, -30.0], [-21.0, -26.0],
                    [-20.0, -22.0], [-19.0, -18.0], [-18.0, -14.0], [-17.0, -10.0],
                    [-16.0, -6.0], [-15.0, -2.0], [-14.0, 2.0], [-13.0, 6.0],
                    [-12.0, 10.0], [-35.0, 12.0], [-50.0, 12.0], [-65.0, 12.0],
                    [-81.0, 12.0]
                ]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Europe" },
            geometry: {
                type: "MultiPolygon",
                coordinates: [
                    // Main Europe
                    [[
                        [-10.0, 71.0], [30.0, 71.0], [60.0, 70.0], [80.0, 68.0],
                        [90.0, 65.0], [95.0, 60.0], [90.0, 55.0], [85.0, 52.0],
                        [80.0, 50.0], [75.0, 48.0], [70.0, 47.0], [65.0, 46.0],
                        [60.0, 45.0], [55.0, 44.0], [50.0, 43.0], [45.0, 42.0],
                        [40.0, 41.0], [35.0, 40.0], [30.0, 39.0], [25.0, 38.0],
                        [20.0, 37.0], [15.0, 36.0], [10.0, 35.0], [5.0, 34.5],
                        [0.0, 35.0], [-5.0, 36.0], [-10.0, 37.0], [-12.0, 40.0],
                        [-10.0, 43.0], [-8.0, 46.0], [-6.0, 49.0], [-4.0, 52.0],
                        [-2.0, 55.0], [0.0, 58.0], [2.0, 61.0], [4.0, 64.0],
                        [6.0, 67.0], [8.0, 69.0], [0.0, 70.0], [-10.0, 71.0]
                    ]],
                    // UK & Ireland
                    [[
                        [-10.0, 60.0], [-8.0, 59.0], [-6.0, 58.0], [-4.0, 57.0],
                        [-2.0, 56.0], [0.0, 55.0], [1.0, 52.0], [0.0, 49.0],
                        [-2.0, 50.0], [-4.0, 51.0], [-6.0, 52.0], [-8.0, 53.0],
                        [-10.0, 54.0], [-11.0, 56.0], [-10.0, 58.0], [-10.0, 60.0]
                    ]],
                    // Scandinavia
                    [[
                        [5.0, 71.0], [15.0, 70.0], [25.0, 69.0], [30.0, 67.0],
                        [28.0, 65.0], [25.0, 63.0], [20.0, 61.0], [15.0, 59.0],
                        [10.0, 57.0], [8.0, 60.0], [6.0, 63.0], [5.0, 66.0],
                        [5.0, 69.0], [5.0, 71.0]
                    ]]
                ]
            }
        },
        {
            type: "Feature",
            properties: { name: "Asia" },
            geometry: {
                type: "MultiPolygon",
                coordinates: [
                    // Main Asia landmass
                    [[
                        [26.0, 71.0], [40.0, 72.0], [60.0, 73.0], [80.0, 74.0],
                        [100.0, 75.0], [120.0, 76.0], [140.0, 77.0], [160.0, 76.0],
                        [170.0, 74.0], [175.0, 70.0], [180.0, 66.0], [179.0, 60.0],
                        [175.0, 55.0], [170.0, 50.0], [165.0, 45.0], [160.0, 40.0],
                        [155.0, 35.0], [150.0, 30.0], [145.0, 25.0], [140.0, 20.0],
                        [135.0, 15.0], [130.0, 10.0], [125.0, 5.0], [120.0, 0.0],
                        [115.0, -5.0], [110.0, -8.0], [105.0, -10.0], [100.0, -10.0],
                        [95.0, -8.0], [90.0, -5.0], [85.0, 0.0], [80.0, 5.0],
                        [75.0, 10.0], [70.0, 15.0], [65.0, 20.0], [60.0, 25.0],
                        [55.0, 30.0], [50.0, 35.0], [45.0, 40.0], [40.0, 45.0],
                        [35.0, 50.0], [30.0, 55.0], [28.0, 60.0], [26.0, 65.0],
                        [26.0, 71.0]
                    ]],
                    // Japan
                    [[
                        [129.0, 45.0], [131.0, 43.0], [135.0, 41.0], [139.0, 39.0],
                        [141.0, 37.0], [143.0, 35.0], [145.0, 33.0], [147.0, 31.0],
                        [145.0, 30.0], [141.0, 31.0], [137.0, 32.0], [133.0, 33.0],
                        [129.0, 34.0], [127.0, 36.0], [126.0, 38.0], [127.0, 40.0],
                        [128.0, 42.0], [129.0, 45.0]
                    ]],
                    // Philippines
                    [[
                        [117.0, 20.0], [119.0, 18.0], [121.0, 16.0], [123.0, 14.0],
                        [125.0, 12.0], [127.0, 10.0], [126.0, 8.0], [124.0, 6.0],
                        [122.0, 4.0], [120.0, 6.0], [118.0, 8.0], [116.0, 10.0],
                        [115.0, 12.0], [116.0, 14.0], [117.0, 16.0], [117.0, 18.0],
                        [117.0, 20.0]
                    ]],
                    // Indonesia
                    [[
                        [95.0, 6.0], [98.0, 4.0], [102.0, 2.0], [106.0, 0.0],
                        [110.0, -2.0], [114.0, -4.0], [118.0, -6.0], [122.0, -8.0],
                        [126.0, -10.0], [130.0, -8.0], [134.0, -6.0], [138.0, -4.0],
                        [140.0, -2.0], [138.0, 0.0], [134.0, 2.0], [130.0, 4.0],
                        [126.0, 6.0], [122.0, 8.0], [118.0, 10.0], [114.0, 8.0],
                        [110.0, 6.0], [106.0, 4.0], [102.0, 6.0], [98.0, 8.0],
                        [95.0, 6.0]
                    ]]
                ]
            }
        },
        {
            type: "Feature",
            properties: { name: "Africa" },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [-17.0, 35.0], [-10.0, 37.0], [-5.0, 35.0], [0.0, 32.0],
                    [5.0, 30.0], [10.0, 32.0], [15.0, 34.0], [20.0, 36.0],
                    [25.0, 35.0], [30.0, 33.0], [35.0, 31.0], [40.0, 28.0],
                    [45.0, 25.0], [48.0, 20.0], [50.0, 15.0], [51.0, 10.0],
                    [50.0, 5.0], [48.0, 0.0], [45.0, -5.0], [42.0, -10.0],
                    [38.0, -15.0], [34.0, -20.0], [30.0, -25.0], [25.0, -30.0],
                    [20.0, -33.0], [15.0, -34.0], [10.0, -34.5], [5.0, -34.0],
                    [0.0, -33.0], [-5.0, -30.0], [-8.0, -25.0], [-10.0, -20.0],
                    [-12.0, -15.0], [-14.0, -10.0], [-15.0, -5.0], [-16.0, 0.0],
                    [-17.0, 5.0], [-18.0, 10.0], [-17.0, 15.0], [-16.0, 20.0],
                    [-17.0, 25.0], [-17.0, 30.0], [-17.0, 35.0]
                ]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Australia" },
            geometry: {
                type: "MultiPolygon",
                coordinates: [
                    // Australia mainland
                    [[
                        [113.0, -10.0], [118.0, -12.0], [123.0, -14.0], [128.0, -12.0],
                        [133.0, -11.0], [138.0, -12.0], [143.0, -14.0], [148.0, -16.0],
                        [153.0, -18.0], [155.0, -22.0], [154.0, -26.0], [152.0, -30.0],
                        [149.0, -34.0], [146.0, -38.0], [143.0, -39.0], [140.0, -38.0],
                        [137.0, -36.0], [134.0, -35.0], [131.0, -34.0], [128.0, -33.0],
                        [125.0, -32.0], [122.0, -31.0], [119.0, -30.0], [116.0, -29.0],
                        [113.0, -28.0], [112.0, -24.0], [113.0, -20.0], [114.0, -16.0],
                        [113.0, -12.0], [113.0, -10.0]
                    ]],
                    // Tasmania
                    [[
                        [143.0, -39.0], [145.0, -41.0], [148.0, -43.0], [148.0, -44.0],
                        [147.0, -45.0], [145.0, -44.0], [143.0, -43.0], [142.0, -41.0],
                        [143.0, -39.0]
                    ]],
                    // New Zealand North Island
                    [[
                        [172.0, -34.0], [174.0, -36.0], [176.0, -38.0], [178.0, -37.0],
                        [179.0, -35.0], [178.0, -33.0], [176.0, -32.0], [174.0, -33.0],
                        [172.0, -34.0]
                    ]],
                    // New Zealand South Island
                    [[
                        [166.0, -40.0], [168.0, -42.0], [170.0, -44.0], [172.0, -46.0],
                        [171.0, -47.0], [169.0, -46.0], [167.0, -44.0], [165.0, -42.0],
                        [166.0, -40.0]
                    ]]
                ]
            }
        }
    ]
};

/**
 * Create realistic Earth geometry from enhanced GeoJSON data.
 */
const createRealisticEarth = (): {
    landGeometry: THREE.BufferGeometry;
    oceanGeometry: THREE.SphereGeometry;
} => {
    const earthRadius = 2.0;
    const landGeometry = new THREE.BufferGeometry();
    const allVertices: number[] = [];
    const allIndices: number[] = [];

    // Helper to convert Lat/Lng to 3D Cartesian coordinates
    const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        return new THREE.Vector3(x, y, z);
    };

    let vertexOffset = 0;

    // Process each continent in the GeoJSON
    realisticWorldGeoJson.features.forEach(feature => {
        const geometry = feature.geometry;
        
        if (geometry.type === 'Polygon') {
            const coordinates = geometry.coordinates as number[][][];
            processPolygon(coordinates);
        } else if (geometry.type === 'MultiPolygon') {
            const coordinates = geometry.coordinates as number[][][][];
            coordinates.forEach(polygon => processPolygon(polygon));
        }

        function processPolygon(polygon: number[][][]) {
            // Convert coordinates to 3D points
            const rings = polygon.map(ring =>
                ring.map(([lon, lat]) => latLonToVector3(lat, lon, earthRadius))
            );

            const outerRing = rings[0];
            const holes = rings.slice(1);

            // Create 2D coordinates for triangulation
            const vertices2D: number[] = [];
            outerRing.forEach(v => {
                vertices2D.push(v.x, v.z); // Use x,z for 2D projection
            });

            const holeIndices: number[] = [];
            holes.forEach(hole => {
                holeIndices.push(vertices2D.length / 2);
                hole.forEach(v => {
                    vertices2D.push(v.x, v.z);
                });
            });

            // Triangulate
            const triangleIndices = earcut(vertices2D, holeIndices, 2);

            // Add vertices to the main array
            const allRingVertices = [outerRing, ...holes].flat();
            allRingVertices.forEach(v => {
                allVertices.push(v.x, v.y, v.z);
            });

            // Add indices with offset
            triangleIndices.forEach(index => {
                allIndices.push(index + vertexOffset);
            });

            vertexOffset += allRingVertices.length;
        }
    });

    landGeometry.setAttribute('position', new THREE.Float32BufferAttribute(allVertices, 3));
    landGeometry.setIndex(allIndices);
    landGeometry.computeVertexNormals();

    const oceanGeometry = new THREE.SphereGeometry(earthRadius - 0.01, 64, 64);

    return { landGeometry, oceanGeometry };
};

// Simple Orbit Controls Class
class SimpleOrbitControls {
    camera: THREE.Camera;
    domElement: HTMLElement;
    enabled: boolean;
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableZoom: boolean;
    minDistance: number;
    maxDistance: number;
    dampingFactor: number;
    enableDamping: boolean;
    spherical: THREE.Spherical;
    sphericalDelta: THREE.Spherical;
    target: THREE.Vector3;
    scale: number;
    rotateSpeed: number;
    state: { NONE: number; ROTATE: number; ZOOM: number };
    currentState: number;
    rotateStart: THREE.Vector2;
    rotateEnd: THREE.Vector2;
    rotateDelta: THREE.Vector2;
    isUserInteracting: boolean;
    lastInteractionTime: number;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.enabled = true;
        this.autoRotate = true;
        this.autoRotateSpeed = 0.2;
        this.enableZoom = true;
        this.minDistance = 4;
        this.maxDistance = 20;
        this.dampingFactor = 0.05;
        this.enableDamping = true;

        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();
        this.target = new THREE.Vector3();
        this.scale = 1;
        this.rotateSpeed = 0.5;

        this.state = { NONE: -1, ROTATE: 0, ZOOM: 1 };
        this.currentState = this.state.NONE;

        this.rotateStart = new THREE.Vector2();
        this.rotateEnd = new THREE.Vector2();
        this.rotateDelta = new THREE.Vector2();

        this.isUserInteracting = false;
        this.lastInteractionTime = 0;

        this.bindEvents();
        this.update();
    }

    bindEvents(): void {
        this.domElement.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.domElement.addEventListener("wheel", this.onMouseWheel.bind(this), {
            passive: false,
        });
        this.domElement.addEventListener(
            "touchstart",
            this.onTouchStart.bind(this),
            { passive: false }
        );
        this.domElement.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    onMouseDown(event: MouseEvent): void {
        if (!this.enabled) return;
        event.preventDefault();

        this.isUserInteracting = true;
        this.lastInteractionTime = Date.now();

        this.rotateStart.set(event.clientX, event.clientY);
        this.currentState = this.state.ROTATE;

        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        document.addEventListener("mouseup", this.onMouseUp.bind(this));
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.enabled || this.currentState !== this.state.ROTATE) return;
        event.preventDefault();

        this.rotateEnd.set(event.clientX, event.clientY);
        this.rotateDelta
            .subVectors(this.rotateEnd, this.rotateStart)
            .multiplyScalar(this.rotateSpeed);

        this.sphericalDelta.theta -=
            (2 * Math.PI * this.rotateDelta.x) / this.domElement.clientHeight;
        this.sphericalDelta.phi -=
            (2 * Math.PI * this.rotateDelta.y) / this.domElement.clientHeight;

        this.rotateStart.copy(this.rotateEnd);
    }

    onMouseUp(): void {
        if (!this.enabled) return;

        this.currentState = this.state.NONE;
        this.isUserInteracting = false;

        document.removeEventListener("mousemove", this.onMouseMove.bind(this));
        document.removeEventListener("mouseup", this.onMouseUp.bind(this));
    }

    onMouseWheel(event: WheelEvent): void {
        if (!this.enabled || !this.enableZoom) return;
        event.preventDefault();

        this.isUserInteracting = true;
        this.lastInteractionTime = Date.now();

        const zoomScale = event.deltaY < 0 ? 0.9 : 1.1;
        this.scale *= zoomScale;
    }

    onTouchStart(event: TouchEvent): void {
        if (!this.enabled) return;
        event.preventDefault();

        this.isUserInteracting = true;
        this.lastInteractionTime = Date.now();

        const touches = event.touches;

        if (touches.length === 1) {
            this.rotateStart.set(touches[0].pageX, touches[0].pageY);
            this.currentState = this.state.ROTATE;
        } else if (touches.length === 2) {
            this.currentState = this.state.ZOOM;
        }

        document.addEventListener("touchmove", this.onTouchMove.bind(this), {
            passive: false,
        });
        document.addEventListener("touchend", this.onTouchEnd.bind(this));
    }

    onTouchMove(event: TouchEvent): void {
        if (!this.enabled) return;
        event.preventDefault();

        const touches = event.touches;

        if (touches.length === 1 && this.currentState === this.state.ROTATE) {
            this.rotateEnd.set(touches[0].pageX, touches[0].pageY);
            this.rotateDelta
                .subVectors(this.rotateEnd, this.rotateStart)
                .multiplyScalar(this.rotateSpeed);

            this.sphericalDelta.theta -=
                (2 * Math.PI * this.rotateDelta.x) / this.domElement.clientHeight;
            this.sphericalDelta.phi -=
                (2 * Math.PI * this.rotateDelta.y) / this.domElement.clientHeight;

            this.rotateStart.copy(this.rotateEnd);
        }
    }

    onTouchEnd(event: TouchEvent): void {
        if (!this.enabled) return;

        if (event.touches.length === 0) {
            this.currentState = this.state.NONE;
            this.isUserInteracting = false;

            document.removeEventListener("touchmove", this.onTouchMove.bind(this));
            document.removeEventListener("touchend", this.onTouchEnd.bind(this));
        }
    }

    update(): boolean {
        const offset = new THREE.Vector3();
        const position = this.camera.position;

        offset.copy(position).sub(this.target);
        this.spherical.setFromVector3(offset);

        const timeSinceInteraction = Date.now() - this.lastInteractionTime;
        if (
            this.autoRotate &&
            !this.isUserInteracting &&
            timeSinceInteraction > 3000
        ) {
            this.sphericalDelta.theta -=
                ((2 * Math.PI) / 60 / 60) * this.autoRotateSpeed;
        }

        if (this.enableDamping) {
            this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor;
            this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor;
            this.sphericalDelta.theta *= 1 - this.dampingFactor;
            this.sphericalDelta.phi *= 1 - this.dampingFactor;
        } else {
            this.spherical.theta += this.sphericalDelta.theta;
            this.spherical.phi += this.sphericalDelta.phi;
            this.sphericalDelta.set(0, 0, 0);
        }

        this.spherical.phi = Math.max(
            0.1,
            Math.min(Math.PI - 0.1, this.spherical.phi)
        );
        this.spherical.radius = Math.max(
            this.minDistance,
            Math.min(this.maxDistance, this.spherical.radius * this.scale)
        );

        offset.setFromSpherical(this.spherical);
        position.copy(this.target).add(offset);

        this.camera.lookAt(this.target);

        this.scale = 1;

        return true;
    }

    dispose(): void {
        // Remove event listeners
    }
}

// Enhanced Earth Globe Component
const SpaceEarthGlobe: React.FC<{
    selectedContinent: string | null;
    selectedCountry: string | null;
    onPointClick: (point: TrafficPoint) => void;
    trafficData: TrafficPoint[];
    isLoading: boolean;
}> = ({ selectedContinent, selectedCountry, onPointClick, trafficData, isLoading }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const animationRef = useRef<number | null>(null);
    const controlsRef = useRef<SimpleOrbitControls | null>(null);
    const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
    const earthGroupRef = useRef<THREE.Group | null>(null);
    const trafficGroupRef = useRef<THREE.Group | null>(null);
    const dataPacketsRef = useRef<DataPacket[]>([]);
    const clickableObjectsRef = useRef<THREE.Mesh[]>([]);

    const initializeScene = useCallback(() => {
        if (!mountRef.current || isLoading) return;

        const container = mountRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000510);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 8);
        cameraRef.current = camera;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        container.appendChild(renderer.domElement);

        // Initialize controls
        controlsRef.current = new SimpleOrbitControls(camera, renderer.domElement);

        // Create Earth group
        const earthGroup = new THREE.Group();
        earthGroupRef.current = earthGroup;
        scene.add(earthGroup);

        // Create realistic Earth
        const { landGeometry, oceanGeometry } = createRealisticEarth();

        // Ocean with enhanced water appearance
        const oceanMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a4c96,
            shininess: 100,
            specular: 0x4a9fff,
            transparent: false,
        });
        const oceanSphere = new THREE.Mesh(oceanGeometry, oceanMaterial);
        oceanSphere.receiveShadow = true;
        earthGroup.add(oceanSphere);

        // Enhanced landmasses with realistic coloring
        const landMaterial = new THREE.MeshLambertMaterial({
            color: 0x2d5016, // Rich forest green
            transparent: false,
        });
        const landMesh = new THREE.Mesh(landGeometry, landMaterial);
        landMesh.castShadow = true;
        earthGroup.add(landMesh);

        // Subtle atmosphere glow
        const atmosphereGeometry = new THREE.SphereGeometry(2.05, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide,
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphere);

        // Traffic group
        const trafficGroup = new THREE.Group();
        trafficGroupRef.current = trafficGroup;
        scene.add(trafficGroup);

        // Enhanced lighting for realistic appearance
        const ambientLight = new THREE.AmbientLight(0x404854, 0.3);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(10, 5, 5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        scene.add(sunLight);

        const fillLight = new THREE.DirectionalLight(0x4a90e2, 0.4);
        fillLight.position.set(-8, -3, -5);
        scene.add(fillLight);

        // Enhanced starfield
        const createStarfield = () => {
            const starsGeometry = new THREE.BufferGeometry();
            const starsCount = 3000;
            const starsPositions = new Float32Array(starsCount * 3);
            const starsColors = new Float32Array(starsCount * 3);

            for (let i = 0; i < starsCount; i++) {
                const i3 = i * 3;

                // Position stars in a sphere around the scene
                const r = 80 + Math.random() * 200;
                const phi = Math.acos(2 * Math.random() - 1);
                const theta = Math.random() * 2 * Math.PI;

                starsPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
                starsPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                starsPositions[i3 + 2] = r * Math.cos(phi);

                // Realistic star colors
                const starType = Math.random();
                if (starType < 0.6) {
                    // White stars (most common)
                    starsColors[i3] = 1.0;
                    starsColors[i3 + 1] = 1.0;
                    starsColors[i3 + 2] = 1.0;
                } else if (starType < 0.8) {
                    // Blue-white stars
                    starsColors[i3] = 0.8;
                    starsColors[i3 + 1] = 0.9;
                    starsColors[i3 + 2] = 1.0;
                } else {
                    // Yellow-orange stars
                    starsColors[i3] = 1.0;
                    starsColors[i3 + 1] = 0.9;
                    starsColors[i3 + 2] = 0.7;
                }
            }

            starsGeometry.setAttribute(
                "position",
                new THREE.BufferAttribute(starsPositions, 3)
            );
            starsGeometry.setAttribute(
                "color",
                new THREE.BufferAttribute(starsColors, 3)
            );

            const starsMaterial = new THREE.PointsMaterial({
                size: 0.8,
                transparent: true,
                opacity: 0.9,
                vertexColors: true,
                sizeAttenuation: true,
            });

            const stars = new THREE.Points(starsGeometry, starsMaterial);
            scene.add(stars);

            return stars;
        };

        const starfield = createStarfield();

        // Mouse and touch interaction handlers
        const handleInteraction = (clientX: number, clientY: number) => {
            const rect = container.getBoundingClientRect();
            mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        };

        const handleMouseMove = (event: MouseEvent) => {
            handleInteraction(event.clientX, event.clientY);
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (event.touches.length > 0) {
                handleInteraction(event.touches[0].clientX, event.touches[0].clientY);
            }
        };

        const handleClick = (event: Event) => {
            event.preventDefault();

            if (!trafficGroupRef.current || !camera) return;

            raycasterRef.current.setFromCamera(mouseRef.current, camera);
            const intersects = raycasterRef.current.intersectObjects(
                clickableObjectsRef.current,
                false
            );

            if (intersects.length > 0) {
                const clickedObject = intersects[0].object as THREE.Mesh & {
                    userData: { pointData?: TrafficPoint };
                };
                if (clickedObject.userData?.pointData) {
                    onPointClick(clickedObject.userData.pointData);
                }
            }
        };

        renderer.domElement.addEventListener("mousemove", handleMouseMove, {
            passive: true,
        });
        renderer.domElement.addEventListener("touchmove", handleTouchMove, {
            passive: true,
        });
        renderer.domElement.addEventListener("click", handleClick);
        renderer.domElement.addEventListener("touchend", handleClick);

        // Animation loop
        const animate = () => {
            animationRef.current = requestAnimationFrame(animate);

            const time = Date.now() * 0.001;

            if (controlsRef.current) {
                controlsRef.current.update();
            }

            // Animate data packets
            dataPacketsRef.current.forEach((packet, index) => {
                if (packet.mesh && packet.curve) {
                    packet.progress += packet.speed * 0.01;
                    if (packet.progress > 1) {
                        packet.progress = 0;
                        packet.speed = 0.5 + Math.random() * 0.5;
                    }

                    const position = packet.curve.getPoint(packet.progress);
                    packet.mesh.position.copy(position);

                    // Fade effect
                    const fadeZone = 0.1;
                    let opacity = 1;
                    if (packet.progress < fadeZone) {
                        opacity = packet.progress / fadeZone;
                    } else if (packet.progress > 1 - fadeZone) {
                        opacity = (1 - packet.progress) / fadeZone;
                    }

                    if (packet.mesh.material instanceof THREE.MeshBasicMaterial) {
                        packet.mesh.material.opacity = opacity * 0.8;
                    }

                    // Scale animation
                    const scale = packet.size * (0.8 + 0.4 * Math.sin(time * 3 + index));
                    packet.mesh.scale.setScalar(scale);
                }
            });

            // Animate traffic nodes
            if (trafficGroupRef.current) {
                trafficGroupRef.current.children.forEach((child, index) => {
                    const mesh = child as THREE.Mesh & {
                        userData: { isPulse?: boolean; isGlow?: boolean };
                    };

                    if (mesh.userData?.isPulse) {
                        const pulseTime = time * 2 + index * 0.3;
                        const scale = 1 + Math.sin(pulseTime) * 0.3;
                        mesh.scale.setScalar(scale);
                        if (mesh.material instanceof THREE.MeshBasicMaterial) {
                            mesh.material.opacity = 0.5 + Math.sin(pulseTime) * 0.3;
                        }
                    }

                    if (mesh.userData?.isGlow) {
                        if (mesh.material instanceof THREE.MeshBasicMaterial) {
                            mesh.material.opacity =
                                0.2 + Math.sin(time * 1.5 + index * 0.4) * 0.15;
                        }
                        mesh.rotation.z += 0.01;
                    }
                });
            }

            renderer.render(scene, camera);
        };

        animate();

        // Handle resize
        const handleResize = () => {
            if (!container || !renderer || !camera) return;

            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;

            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            renderer.domElement.removeEventListener("mousemove", handleMouseMove);
            renderer.domElement.removeEventListener("touchmove", handleTouchMove);
            renderer.domElement.removeEventListener("click", handleClick);
            renderer.domElement.removeEventListener("touchend", handleClick);
            if (controlsRef.current) {
                controlsRef.current.dispose();
            }
        };
    }, [onPointClick, isLoading]);

    const updateTrafficVisualization = useCallback(() => {
        if (!trafficGroupRef.current || isLoading || !earthGroupRef.current) return;

        // Clear existing
        while (trafficGroupRef.current.children.length > 0) {
            const child = trafficGroupRef.current.children[0];
            trafficGroupRef.current.remove(child);
        }
        dataPacketsRef.current = [];
        clickableObjectsRef.current = [];

        // Filter data based on selected continent and country
        let filteredData = trafficData;
        if (selectedContinent && selectedContinent !== 'Global View') {
            filteredData = filteredData.filter(point => point.continent === selectedContinent);
        }
        if (selectedCountry && selectedCountry !== 'All Countries') {
            filteredData = filteredData.filter(point => point.country === selectedCountry);
        }

        // Create traffic nodes
        filteredData.forEach((point, index) => {
            const phi = (90 - point.lat) * (Math.PI / 180);
            const theta = (point.lng + 180) * (Math.PI / 180);

            const radius = 2.08; // Slightly above landmass
            const x = -(radius * Math.sin(phi) * Math.cos(theta));
            const z = radius * Math.sin(phi) * Math.sin(theta);
            const y = radius * Math.cos(phi);

            point.coordinates = { x, y, z };

            let color: string, size: number;
            switch (point.tier) {
                case "mega":
                    color = "#00ff9f";
                    size = 0.07;
                    break;
                case "major":
                    color = "#00bfff";
                    size = 0.055;
                    break;
                case "medium":
                    color = "#ffaa00";
                    size = 0.04;
                    break;
                default:
                    color = "#ff6b6b";
                    size = 0.03;
            }

            // Status color modification
            if (point.status === "degraded") {
                color = "#ffaa00";
            } else if (point.status === "offline") {
                color = "#ff4757";
            }

            // Main hub with enhanced appearance
            const hubGeometry = new THREE.SphereGeometry(size, 20, 20);
            const hubMaterial = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.95,
                emissive: color,
                emissiveIntensity: 0.4,
                shininess: 100,
            });
            const hub = new THREE.Mesh(hubGeometry, hubMaterial);
            hub.position.set(x, y, z);
            hub.userData = {
                pointData: point,
                isInteractive: true,
            };

            // Add to clickable objects
            clickableObjectsRef.current.push(hub);

            // Enhanced pulse ring
            const ringGeometry = new THREE.RingGeometry(size * 2, size * 2.5, 20);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide,
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(x, y, z);
            ring.lookAt(0, 0, 0);
            ring.userData = { isPulse: true };

            // Enhanced glow effect
            const glowGeometry = new THREE.SphereGeometry(size * 3, 12, 12);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.15,
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.set(x, y, z);
            glow.userData = { isGlow: true };

            trafficGroupRef.current?.add(hub, ring, glow);
        });

        // Create enhanced connections between major hubs
        const majorHubs = filteredData.filter(
            (point) => point.tier === "mega" || point.tier === "major"
        );

        for (let i = 0; i < majorHubs.length; i++) {
            for (let j = i + 1; j < majorHubs.length && j < i + 4; j++) {
                const hub1 = majorHubs[i];
                const hub2 = majorHubs[j];

                const start = new THREE.Vector3(
                    hub1.coordinates.x,
                    hub1.coordinates.y,
                    hub1.coordinates.z
                );
                const end = new THREE.Vector3(
                    hub2.coordinates.x,
                    hub2.coordinates.y,
                    hub2.coordinates.z
                );

                const midPoint = new THREE.Vector3()
                    .addVectors(start, end)
                    .multiplyScalar(0.5);
                const distance = start.distanceTo(end);
                midPoint.normalize().multiplyScalar(2.0 + distance * 0.5);

                const curve = new THREE.CatmullRomCurve3([start, midPoint, end]);
                const points = curve.getPoints(60);

                const connectionGeometry = new THREE.BufferGeometry().setFromPoints(
                    points
                );
                const connectionMaterial = new THREE.LineBasicMaterial({
                    color: hub1.tier === "mega" ? 0x00ff9f : 0x00bfff,
                    transparent: true,
                    opacity: 0.5,
                    linewidth: 2,
                });
                const connection = new THREE.Line(
                    connectionGeometry,
                    connectionMaterial
                );
                trafficGroupRef.current?.add(connection);

                // Enhanced data packets
                for (let k = 0; k < 3; k++) {
                    const packetGeometry = new THREE.SphereGeometry(0.02, 10, 10);
                    const packetMaterial = new THREE.MeshBasicMaterial({
                        color: "#ffffff",
                        transparent: true,
                        opacity: 0.9,
                    });
                    const packet = new THREE.Mesh(packetGeometry, packetMaterial);

                    const dataPacket: DataPacket = {
                        mesh: packet,
                        curve: curve,
                        progress: Math.random(),
                        speed: 0.3 + Math.random() * 0.4,
                        color: "#ffffff",
                        size: 1 + Math.random() * 0.8,
                    };

                    dataPacketsRef.current.push(dataPacket);
                    trafficGroupRef.current?.add(packet);
                }
            }
        }

        earthGroupRef.current.add(trafficGroupRef.current);

        // Enhanced cursor handling
        const handleMouseMove = (event: MouseEvent) => {
            if (!cameraRef.current || !rendererRef.current) return;

            const rect = rendererRef.current.domElement.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            mouseRef.current.set(x, y);
            raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

            const intersects = raycasterRef.current.intersectObjects(
                clickableObjectsRef.current
            );

            if (rendererRef.current) {
                rendererRef.current.domElement.style.cursor =
                    intersects.length > 0 ? "pointer" : "default";
            }
        };

        if (rendererRef.current) {
            rendererRef.current.domElement.addEventListener(
                "mousemove",
                handleMouseMove
            );

            return () => {
                if (rendererRef.current) {
                    rendererRef.current.domElement.removeEventListener(
                        "mousemove",
                        handleMouseMove
                    );
                }
            };
        }
    }, [selectedContinent, selectedCountry, trafficData, isLoading]);

    useEffect(() => {
        const cleanup = initializeScene();
        return () => {
            if (cleanup) cleanup();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
        };
    }, [initializeScene]);

    useEffect(() => {
        updateTrafficVisualization();
    }, [updateTrafficVisualization]);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-black">
                <div className="text-center">
                    <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-white text-xl font-light font-['Poppins']">
                        Initializing Global Network...
                    </p>
                    <p className="text-cyan-400 text-sm mt-2 font-['Poppins']">Connecting to satellites</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            <div
                ref={mountRef}
                className="w-full h-full"
                style={{ touchAction: "none" }}
            />
        </div>
    );
};

// Enhanced Stats Panel with Country Filtering
const GlassmorphismStatsPanel: React.FC<{
    stats: GlobalStats;
    continentStats: ContinentInfo[];
    countryStats: CountryInfo[];
    isOpen: boolean;
    onToggle: () => void;
    selectedContinent: string | null;
    selectedCountry: string | null;
    onContinentSelect: (continent: string | null) => void;
    onCountrySelect: (country: string | null) => void;
    trafficData: TrafficPoint[];
}> = ({
          stats,
          continentStats,
          countryStats,
          isOpen,
          onToggle,
          selectedContinent,
          selectedCountry,
          onContinentSelect,
          onCountrySelect,
          trafficData,
      }) => {

    // Get countries for selected continent
    const availableCountries = useMemo(() => {
        if (!selectedContinent || selectedContinent === 'Global View') {
            return [];
        }
        return countryStats.filter(country => country.continent === selectedContinent);
    }, [selectedContinent, countryStats]);

    return (
        <>
            {/* Mobile toggle button */}
            <button
                onClick={onToggle}
                className="md:hidden fixed top-4 left-4 z-50 bg-white/10 backdrop-blur-xl rounded-2xl p-3 text-white border border-white/20 shadow-2xl hover:bg-white/20 cursor-pointer transition-all duration-300"
            >
                <RiDashboardLine className="w-6 h-6" />
            </button>

            {/* Stats panel */}
            <div
                className={`
          fixed md:relative top-0 left-0 h-screen w-80 md:w-80 lg:w-96 
          transform transition-transform duration-300 z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          overflow-y-auto backdrop-blur-2xl border-r border-white/10 opacity-90
        `}
            >
                <div className="p-6 font-['Poppins']">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                            Network Control
                        </h2>
                        <button
                            onClick={onToggle}
                            className="md:hidden text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Global status */}
                    <div className="mb-8 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <BiWorld className="text-xl" /> Global Status
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-cyan-400">
                                    {stats.totalHubs}
                                </div>
                                <div className="text-xs text-gray-300">Total Hubs</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">
                                    {stats.onlineHubs}
                                </div>
                                <div className="text-xs text-gray-300">Online</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-400">
                                    {(stats.totalTraffic / 1000000).toFixed(1)}M
                                </div>
                                <div className="text-xs text-gray-300">GB/s</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-400">
                                    {stats.averageLatency.toFixed(0)}ms
                                </div>
                                <div className="text-xs text-gray-300">Latency</div>
                            </div>
                        </div>
                    </div>

                    {/* Region filters */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                            <BiNetworkChart className="text-xl" /> Regional Controls
                        </h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    onContinentSelect(null);
                                    onCountrySelect(null);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 flex items-center justify-between border cursor-pointer hover:bg-white/15 ${
                                    selectedContinent === null
                                        ? "bg-white/20 text-white border-white/30"
                                        : "text-gray-300 hover:bg-white/10 border-white/10"
                                }`}
                            >
                  <span className="flex items-center gap-3">
                    <BiWorld className="text-xl" />
                    <span>Global View</span>
                  </span>
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {trafficData.length}
                  </span>
                            </button>
                            {continentStats.map((continent) => (
                                <button
                                    key={continent.name}
                                    onClick={() => {
                                        onContinentSelect(continent.name);
                                        onCountrySelect(null);
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 flex items-center justify-between border cursor-pointer hover:bg-white/15 ${
                                        selectedContinent === continent.name
                                            ? "bg-white/20 text-white border-white/30"
                                            : "text-gray-300 hover:bg-white/10 border-white/10"
                                    }`}
                                >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">
                        {continent.name === "North America" ? (
                            <FaGlobeAmericas />
                        ) : continent.name === "South America" ? (
                            <FaGlobeAmericas />
                        ) : continent.name === "Europe" ? (
                            <FaGlobeEurope />
                        ) : continent.name === "Asia" ? (
                            <FaGlobeAsia />
                        ) : continent.name === "Africa" ? (
                            <FaGlobeAfrica />
                        ) : (
                            <BiWorld />
                        )}
                      </span>
                      <span>{continent.name}</span>
                    </span>
                                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {continent.points}
                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Country filters - shown when continent is selected */}
                    {selectedContinent && selectedContinent !== 'Global View' && availableCountries.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                                <MdLocationOn className="text-xl" /> Country Filters
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                <button
                                    onClick={() => onCountrySelect(null)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 flex items-center justify-between border cursor-pointer hover:bg-white/15 ${
                                        selectedCountry === null
                                            ? "bg-white/20 text-white border-white/30"
                                            : "text-gray-300 hover:bg-white/10 border-white/10"
                                    }`}
                                >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">🌍</span>
                      <span>All Countries</span>
                    </span>
                                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {availableCountries.reduce((sum, country) => sum + country.points, 0)}
                    </span>
                                </button>
                                {availableCountries.map((country) => (
                                    <button
                                        key={country.name}
                                        onClick={() => onCountrySelect(country.name)}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 flex items-center justify-between border cursor-pointer hover:bg-white/15 ${
                                            selectedCountry === country.name
                                                ? "bg-white/20 text-white border-white/30"
                                                : "text-gray-300 hover:bg-white/10 border-white/10"
                                        }`}
                                    >
                        <span className="flex items-center gap-3">
                          <span className="text-lg">
                            {country.name === "United States" ? "🇺🇸" :
                                country.name === "Canada" ? "🇨🇦" :
                                    country.name === "Germany" ? "🇩🇪" :
                                        country.name === "United Kingdom" ? "🇬🇧" :
                                            country.name === "Netherlands" ? "🇳🇱" :
                                                country.name === "France" ? "🇫🇷" :
                                                    country.name === "Italy" ? "🇮🇹" :
                                                        country.name === "Spain" ? "🇪🇸" :
                                                            country.name === "Sweden" ? "🇸🇪" :
                                                                country.name === "Russia" ? "🇷🇺" :
                                                                    country.name === "Japan" ? "🇯🇵" :
                                                                        country.name === "Singapore" ? "🇸🇬" :
                                                                            country.name === "Hong Kong" ? "🇭🇰" :
                                                                                country.name === "South Korea" ? "🇰🇷" :
                                                                                    country.name === "India" ? "🇮🇳" :
                                                                                        country.name === "UAE" ? "🇦🇪" :
                                                                                            country.name === "Thailand" ? "🇹🇭" :
                                                                                                country.name === "China" ? "🇨🇳" :
                                                                                                    country.name === "Brazil" ? "🇧🇷" :
                                                                                                        country.name === "Colombia" ? "🇨🇴" :
                                                                                                            country.name === "Argentina" ? "🇦🇷" :
                                                                                                                country.name === "South Africa" ? "🇿🇦" :
                                                                                                                    country.name === "Egypt" ? "🇪🇬" :
                                                                                                                        country.name === "Nigeria" ? "🇳🇬" :
                                                                                                                            country.name === "Australia" ? "🇦🇺" :
                                                                                                                                country.name === "New Zealand" ? "🇳🇿" : "🏴"}
                          </span>
                          <span>{country.name}</span>
                        </span>
                                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          {country.points}
                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Traffic analysis */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                            <IoStatsChart className="text-xl" /> Traffic Analysis
                        </h3>
                        <div className="space-y-4">
                            {continentStats.map((continent) => (
                                <div
                                    key={continent.name}
                                    className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                                    onClick={() => {
                                        onContinentSelect(continent.name);
                                        onCountrySelect(null);
                                    }}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                    <span className="text-white font-medium text-sm flex items-center gap-2">
                        {continent.name === "North America" ? (
                            <FaGlobeAmericas className="text-blue-400" />
                        ) : continent.name === "South America" ? (
                            <FaGlobeAmericas className="text-green-400" />
                        ) : continent.name === "Europe" ? (
                            <FaGlobeEurope className="text-purple-400" />
                        ) : continent.name === "Asia" ? (
                            <FaGlobeAsia className="text-orange-400" />
                        ) : continent.name === "Africa" ? (
                            <FaGlobeAfrica className="text-yellow-400" />
                        ) : (
                            <BiWorld className="text-cyan-400" />
                        )}
                          {continent.name}
                      </span>
                                        <div className="flex gap-2 text-xs">
                        <span className="text-gray-300 flex items-center gap-1">
                          <MdOutlineRouter className="text-gray-400" />{" "}
                            {continent.points}
                        </span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-300 flex items-center gap-1">
                          <IoStatsChart className="text-gray-400" />{" "}
                                                {continent.uptime.toFixed(1)}%
                        </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
                                        <div
                                            className="h-2 rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${
                                                    (continent.totalTraffic /
                                                        Math.max(
                                                            ...continentStats.map((c) => c.totalTraffic)
                                                        )) *
                                                    100
                                                }%`,
                                                backgroundColor: continent.color,
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 flex items-center gap-1">
                        <MdSpeed className="text-gray-400" />
                          {(continent.totalTraffic / 1000000).toFixed(1)}M GB/s
                      </span>
                                        <span className="text-gray-400 flex items-center gap-1">
                        <AiOutlineWarning className="text-gray-400" />
                                            {continent.avgLatency.toFixed(0)}ms avg
                      </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live status */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                Live Network Data
                            </div>
                            <div className="text-xs text-gray-500">Updated now</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-30 cursor-pointer"
                    onClick={onToggle}
                />
            )}
        </>
    );
};

// Enhanced Detail Modal Component
const EnhancedDetailModal: React.FC<{
    point: TrafficPoint;
    onClose: () => void;
}> = ({ point, onClose }) => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4 font-['Poppins']">
        <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/20 bg-black/60 backdrop-blur-xl">
            <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex-1 mr-6">
                        <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4">
                            {point.name}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm mb-6">
              <span className="px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm">
                {point.city}, {point.country}
              </span>
                            <span className="px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm capitalize">
                {point.tier} Hub
              </span>
                            <span
                                className={`px-4 py-2 rounded-full font-bold border backdrop-blur-sm ${
                                    point.status === "online"
                                        ? "text-green-400 border-green-500/30 bg-green-500/10"
                                        : point.status === "degraded"
                                            ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                                            : "text-red-400 border-red-500/30 bg-red-500/10"
                                }`}
                            >
                {point.status.toUpperCase()}
              </span>
                        </div>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            {point.description}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors text-2xl p-3 hover:bg-white/10 rounded-full flex-shrink-0 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    <div className="p-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm hover:bg-cyan-500/20 transition-all duration-300 cursor-pointer">
                        <div className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                            <IoStatsChart /> Peak Traffic
                        </div>
                        <div className="text-white font-bold text-3xl">
                            {(point.traffic / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-cyan-300 text-sm">GB/s</div>
                    </div>
                    <div className="p-6 rounded-2xl border border-green-500/30 bg-green-500/10 backdrop-blur-sm hover:bg-green-500/20 transition-all duration-300 cursor-pointer">
                        <div className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                            <MdSpeed /> Bandwidth
                        </div>
                        <div className="text-white font-bold text-3xl">
                            {(point.bandwidth / 1000000).toFixed(0)}T
                        </div>
                        <div className="text-green-300 text-sm">bps</div>
                    </div>
                    <div className="p-6 rounded-2xl border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm hover:bg-purple-500/20 transition-all duration-300 cursor-pointer">
                        <div className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                            <MdPeople /> Peers
                        </div>
                        <div className="text-white font-bold text-3xl">
                            {point.peersConnected}
                        </div>
                        <div className="text-purple-300 text-sm">Networks</div>
                    </div>
                    <div className="p-6 rounded-2xl border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm hover:bg-orange-500/20 transition-all duration-300 cursor-pointer">
                        <div className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                            <MdSpeed /> Latency
                        </div>
                        <div className="text-white font-bold text-3xl">{point.latency}</div>
                        <div className="text-orange-300 text-sm">ms avg</div>
                    </div>
                </div>

                {/* Technical details */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                        <h4 className="text-white font-medium mb-6 text-xl flex items-center gap-3">
                            <BsBuilding /> Infrastructure Details
                        </h4>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-gray-400">Provider:</span>
                                <span className="text-white font-medium">{point.provider}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-gray-400">Established:</span>
                                <span className="text-white font-medium">
                  {point.established}
                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-gray-400">Active Connections:</span>
                                <span className="text-white font-medium">
                  {point.connections.toLocaleString()}
                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-gray-400">Uptime:</span>
                                <span className="text-green-400 font-medium">
                  {point.uptime}%
                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-gray-400">IPv4 Prefixes:</span>
                                <span className="text-white font-medium">
                  {point.ipv4Prefixes.toLocaleString()}
                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-400">IPv6 Prefixes:</span>
                                <span className="text-white font-medium">
                  {point.ipv6Prefixes.toLocaleString()}
                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                        <h4 className="text-white font-medium mb-6 text-xl flex items-center gap-3">
                            <MdLocationOn /> Network Position
                        </h4>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-gray-400">Latitude:</span>
                                <span className="text-white font-mono">
                  {point.lat.toFixed(6)}°
                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-gray-400">Longitude:</span>
                                <span className="text-white font-mono">
                  {point.lng.toFixed(6)}°
                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-gray-400">Region:</span>
                                <span className="text-white font-medium">
                  {point.continent}
                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-gray-400">Packet Loss:</span>
                                <span className="text-white font-medium">
                  {point.packetLoss}%
                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-gray-400">Daily Traffic:</span>
                                <span className="text-white font-medium">
                  {(point.dailyTraffic / 1000000).toFixed(1)}M GB
                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-400">Threat Level:</span>
                                <span
                                    className={`font-medium ${
                                        point.threatLevel === "low"
                                            ? "text-green-400"
                                            : point.threatLevel === "medium"
                                                ? "text-yellow-400"
                                                : "text-red-400"
                                    }`}
                                >
                  {point.threatLevel.toUpperCase()}
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Main Enhanced Application Component
export default function EnhancedGlobalTrafficVisualizer() {
    const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedPoint, setSelectedPoint] = useState<TrafficPoint | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Add Poppins font import
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    // Add effect to handle body scroll lock
    useEffect(() => {
        if (isDetailsOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isDetailsOpen]);

    const trafficData = useMemo(() => generateTrafficData(), []);

    const handlePointClick = useCallback((point: TrafficPoint) => {
        setSelectedPoint(point);
        setIsDetailsOpen(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setIsDetailsOpen(false);
        setSelectedPoint(null);
    }, []);

    const globalStats = useMemo((): GlobalStats => {
        const onlineHubs = trafficData.filter(
            (point) => point.status === "online"
        ).length;
        const totalTraffic = trafficData.reduce(
            (sum, point) => sum + point.traffic,
            0
        );
        const averageLatency =
            trafficData.reduce((sum, point) => sum + point.latency, 0) /
            trafficData.length;
        const totalConnections = trafficData.reduce(
            (sum, point) => sum + point.connections,
            0
        );
        const avgUptime =
            trafficData.reduce((sum, point) => sum + parseFloat(point.uptime), 0) /
            trafficData.length;
        const threatDetections = trafficData.filter(
            (point) => point.threatLevel === "high"
        ).length;

        return {
            totalHubs: trafficData.length,
            onlineHubs,
            totalTraffic,
            averageLatency,
            totalConnections,
            dataTransferred: totalTraffic * 86400,
            globalUptime: avgUptime,
            threatDetections,
        };
    }, [trafficData]);

    const continentStats = useMemo((): ContinentInfo[] => {
        const continents = [
            "North America",
            "South America",
            "Europe",
            "Asia",
            "Africa",
            "Oceania",
        ];
        const colors = [
            "#00bfff",
            "#ff6b6b",
            "#00ff9f",
            "#ffaa00",
            "#9d4edd",
            "#06d6a0",
        ];

        return continents
            .map((continent, index) => {
                const points = trafficData.filter(
                    (point) => point.continent === continent
                );
                const totalTraffic = points.reduce(
                    (sum, point) => sum + point.traffic,
                    0
                );
                const avgLatency =
                    points.length > 0
                        ? points.reduce((sum, point) => sum + point.latency, 0) /
                        points.length
                        : 0;
                const uptime =
                    points.length > 0
                        ? points.reduce((sum, point) => sum + parseFloat(point.uptime), 0) /
                        points.length
                        : 0;

                return {
                    name: continent,
                    color: colors[index],
                    points: points.length,
                    totalTraffic,
                    avgLatency,
                    uptime,
                };
            })
            .filter((continent) => continent.points > 0)
            .sort((a, b) => b.totalTraffic - a.totalTraffic);
    }, [trafficData]);

    const countryStats = useMemo((): CountryInfo[] => {
        const countries = Array.from(new Set(trafficData.map(point => point.country)));
        
        return countries
            .map(country => {
                const points = trafficData.filter(point => point.country === country);
                const continent = points[0]?.continent || '';
                const totalTraffic = points.reduce((sum, point) => sum + point.traffic, 0);
                const avgLatency = points.length > 0 
                    ? points.reduce((sum, point) => sum + point.latency, 0) / points.length 
                    : 0;
                const uptime = points.length > 0 
                    ? points.reduce((sum, point) => sum + parseFloat(point.uptime), 0) / points.length 
                    : 0;

                return {
                    name: country,
                    continent,
                    points: points.length,
                    totalTraffic,
                    avgLatency,
                    uptime,
                };
            })
            .filter(country => country.points > 0)
            .sort((a, b) => b.totalTraffic - a.totalTraffic);
    }, [trafficData]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="max-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white overflow-clip font-['Poppins']">
            {/* Main layout */}
            <div className="flex">
                {/* Stats panel */}
                <GlassmorphismStatsPanel
                    stats={globalStats}
                    continentStats={continentStats}
                    countryStats={countryStats}
                    isOpen={isStatsOpen}
                    onToggle={() => setIsStatsOpen(!isStatsOpen)}
                    selectedContinent={selectedContinent}
                    selectedCountry={selectedCountry}
                    onContinentSelect={setSelectedContinent}
                    onCountrySelect={setSelectedCountry}
                    trafficData={trafficData}
                />

                {/* Globe container */}
                <div className="flex-1 fixed left-0 top-0 right-0 bottom-0 overflow-hidden w-screen h-screen">
                    {/* Navigation hints */}
                    <div className="absolute bottom-6 right-6 p-4 rounded-2xl border border-white/20 text-white text-sm z-10 bg-black/20 backdrop-blur-xl">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <BsArrowsMove className="text-cyan-400" />
                                <span>Drag to orbit Earth</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TbWorldLatitude className="text-purple-400" />
                                <span>Scroll/pinch to zoom</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MdLocationOn className="text-green-400" />
                                <span>Click hubs for details</span>
                            </div>
                        </div>
                    </div>

                    <SpaceEarthGlobe
                        selectedContinent={selectedContinent}
                        selectedCountry={selectedCountry}
                        onPointClick={handlePointClick}
                        trafficData={trafficData}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            {/* Detail modal */}
            {isDetailsOpen && selectedPoint && (
                <EnhancedDetailModal point={selectedPoint} onClose={handleModalClose} />
            )}
        </div>
    );
}


// https://scale-cds-public-us-west-2.s3.amazonaws.com/65cbc42b32ffab95dd54b864/8UU43aP-N2BOzdk